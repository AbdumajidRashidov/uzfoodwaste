// src/docs/reservation.doc.ts

/**
 * @swagger
 * components:
 *   schemas:
 *     ReservationItem:
 *       type: object
 *       required:
 *         - listing_id
 *         - quantity
 *       properties:
 *         listing_id:
 *           type: string
 *           description: ID of the food listing
 *         quantity:
 *           type: integer
 *           minimum: 1
 *           description: Quantity to reserve
 *
 *     CreateReservationRequest:
 *       type: object
 *       required:
 *         - items
 *         - pickup_time
 *       properties:
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ReservationItem'
 *         pickup_time:
 *           type: string
 *           format: date-time
 *           description: Scheduled pickup time
 *
 *     PaymentRequest:
 *       type: object
 *       required:
 *         - amount
 *         - currency
 *         - payment_method
 *       properties:
 *         amount:
 *           type: number
 *           minimum: 0
 *         currency:
 *           type: string
 *           example: "UZS"
 *         payment_method:
 *           type: string
 *           example: "card"
 *
 *     VerifyPickupRequest:
 *       type: object
 *       required:
 *         - confirmation_code
 *       properties:
 *         confirmation_code:
 *           type: string
 *           description: QR code confirmation code
 *
 * /api/reservations:
 *   post:
 *     tags: [Reservations]
 *     summary: Create a new reservation
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateReservationRequest'
 *     responses:
 *       201:
 *         description: Reservation created successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *
 * /api/reservations/{reservationId}/payment:
 *   post:
 *     tags: [Reservations]
 *     summary: Process payment for a reservation
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reservationId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PaymentRequest'
 *     responses:
 *       200:
 *         description: Payment processed successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *
 * /api/reservations/{reservationId}/verify:
 *   post:
 *     tags: [Reservations]
 *     summary: Verify pickup using confirmation code
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reservationId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VerifyPickupRequest'
 *     responses:
 *       200:
 *         description: Pickup verified successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *
 * /api/reservations/{reservationId}/qr:
 *   get:
 *     tags: [Reservations]
 *     summary: Get QR code for a reservation
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reservationId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: QR code data retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Reservation not found
 *
 * /api/reservations/{reservationId}/status:
 *   get:
 *     tags: [Reservations]
 *     summary: Get reservation status
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reservationId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Reservation status retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Reservation not found
 *
 * /api/reservations/customer/list:
 *   get:
 *     tags: [Reservations]
 *     summary: Get customer's reservations
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, CONFIRMED, COMPLETED, CANCELLED]
 *       - in: query
 *         name: from_date
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: to_date
 *         schema:
 *           type: string
 *           format: date-time
 *     responses:
 *       200:
 *         description: List of customer reservations
 *       401:
 *         description: Unauthorized
 *
 * /api/reservations/business/list:
 *   get:
 *     tags: [Reservations]
 *     summary: Get business's reservations
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, CONFIRMED, COMPLETED, CANCELLED]
 *       - in: query
 *         name: from_date
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: to_date
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: branch_id
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of business reservations
 *       401:
 *         description: Unauthorized
 *
 * /api/reservations/{reservationId}:
 *   get:
 *     tags: [Reservations]
 *     summary: Get detailed reservation information
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reservationId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Detailed reservation info retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Reservation not found
 */
// Cancellation Swagger Documentation
/**
 * @swagger
 * components:
 *   schemas:
 *     CancelReservationRequest:
 *       type: object
 *       required:
 *         - cancellation_reason
 *       properties:
 *         cancellation_reason:
 *           type: string
 *           maxLength: 500
 *           description: Reason for cancelling the reservation
 *           example: "Changed my plans"
 *
 * /api/reservations/{reservationId}/cancel:
 *   post:
 *     tags: [Reservations]
 *     summary: Cancel a reservation
 *     description: |
 *       Allows cancellation of a reservation with specific constraints:
 *       - Customers can only cancel PENDING reservations
 *       - Customers cannot cancel after payment is processed
 *       - Businesses can cancel reservations in any status
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reservationId
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique identifier of the reservation to cancel
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CancelReservationRequest'
 *           examples:
 *             customerCancellation:
 *               value:
 *                 cancellation_reason: "Changed my plans"
 *             businessCancellation:
 *               value:
 *                 cancellation_reason: "Listing no longer available"
 *     responses:
 *       200:
 *         description: Reservation cancelled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   description: Cancelled reservation details
 *       400:
 *         description: |
 *           Bad request scenarios:
 *           - Reservation already cancelled
 *           - Attempting to cancel a non-pending reservation as a customer
 *           - Attempting to cancel after payment
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: "You can only cancel pending reservations"
 *       401:
 *         description: Unauthorized - Invalid or missing authentication token
 *       403:
 *         description: Forbidden - Not authorized to cancel this specific reservation
 */
