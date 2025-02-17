// src/services/background-job.service.ts
import Bull, { Queue, Job } from "bull";
import { PrismaClient } from "@prisma/client";
import { getPickupTimeStatus } from "../utils/time.util";
import { config } from "../config/environment";

const prisma = new PrismaClient();

export class BackgroundJobService {
  private statusUpdateQueue: Queue;

  constructor() {
    // Initialize Bull queue with Redis connection
    this.statusUpdateQueue = new Bull("pickup-status-updates", {
      redis: {
        host: config.redis.host,
        port: config.redis.port,
        password: config.redis.password,
      },
      defaultJobOptions: {
        removeOnComplete: true, // Remove jobs from queue once completed
        attempts: 3, // Retry failed jobs up to 3 times
      },
    });

    // Set up queue processors
    this.setupQueueProcessors();

    // Set up error handlers
    this.setupErrorHandlers();
  }

  private setupQueueProcessors() {
    // Process pickup status updates
    this.statusUpdateQueue.process(async (job: Job) => {
      const batchSize = 100; // Process listings in batches
      let processedCount = 0;

      try {
        // Get all active listings
        const listings = await prisma.foodListing.findMany({
          where: {
            status: "AVAILABLE",
            pickup_status: { not: "expired" },
          },
          select: {
            id: true,
            pickup_end: true,
            pickup_status: true,
          },
        });

        // Process listings in batches
        while (processedCount < listings.length) {
          const batch = listings.slice(
            processedCount,
            processedCount + batchSize
          );

          // Update each listing in the batch
          await Promise.all(
            batch.map(async (listing) => {
              const newStatus = getPickupTimeStatus(listing.pickup_end);

              if (newStatus !== listing.pickup_status) {
                await prisma.foodListing.update({
                  where: { id: listing.id },
                  data: {
                    pickup_status: newStatus,
                    // If expired, also update the listing status
                    ...(newStatus === "expired" && { status: "UNAVAILABLE" }),
                  },
                });
              }
            })
          );

          processedCount += batch.length;

          // Update job progress
          job.progress(Math.floor((processedCount / listings.length) * 100));
        }

        return { processed: processedCount };
      } catch (error) {
        console.error("Error processing pickup status updates:", error);
        throw error; // Retry the job
      }
    });
  }

  private setupErrorHandlers() {
    this.statusUpdateQueue.on("error", (error) => {
      console.error("Bull queue error:", error);
    });

    this.statusUpdateQueue.on("failed", (job, error) => {
      console.error(`Job ${job.id} failed:`, error);
    });

    this.statusUpdateQueue.on("completed", (job, result) => {
      console.log(
        `Job ${job.id} completed. Processed ${result.processed} listings`
      );
    });
  }

  /**
   * Start the background jobs
   */
  async startJobs() {
    try {
      // Clean any existing jobs
      await this.statusUpdateQueue.clean(0, "completed");
      await this.statusUpdateQueue.clean(0, "failed");

      // Schedule pickup status update job to run every 5 minutes
      await this.statusUpdateQueue.add(
        {},
        {
          repeat: {
            cron: "*/5 * * * *", // Every 5 minutes
          },
        }
      );

      console.log("Background jobs started successfully");
    } catch (error) {
      console.error("Failed to start background jobs:", error);
      throw error;
    }
  }

  /**
   * Stop all background jobs
   */
  async stopJobs() {
    try {
      await this.statusUpdateQueue.pause();
      await this.statusUpdateQueue.clean(0, "active");
      await this.statusUpdateQueue.clean(0, "wait");
      await this.statusUpdateQueue.clean(0, "delayed");
      console.log("Background jobs stopped successfully");
    } catch (error) {
      console.error("Failed to stop background jobs:", error);
      throw error;
    }
  }

  /**
   * Get the current status of the background jobs
   */
  async getJobStatus() {
    const [waiting, active, completed, failed] = await Promise.all([
      this.statusUpdateQueue.getWaitingCount(),
      this.statusUpdateQueue.getActiveCount(),
      this.statusUpdateQueue.getCompletedCount(),
      this.statusUpdateQueue.getFailedCount(),
    ]);

    return {
      waiting,
      active,
      completed,
      failed,
      isRunning: !(await this.statusUpdateQueue.isPaused()),
    };
  }
}
