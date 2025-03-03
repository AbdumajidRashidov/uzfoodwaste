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
 *         allow_multiple_businesses:
 *           type: boolean
 *           description: Whether to allow items from multiple businesses in one reservation
 *           default: false
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
 *     VerifyPickupByNumberRequest:
 *       type: object
 *       required:
 *         - reservation_number
 *         - confirmation_code
 *       properties:
 *         reservation_number:
 *           type: string
 *           description: Reservation number (e.g., BIZ-20250302-00001)
 *         confirmation_code:
 *           type: string
 *           description: QR code confirmation code
 *
 * /api/reservations:
 *   post:
 *     tags: [Reservations]
 *     summary: Create a new reservation
 *     description: |
 *       Creates a new reservation for food items.
 *       - If items are from multiple businesses and allow_multiple_businesses is false (default), throws an error
 *       - If items are from multiple businesses and allow_multiple_businesses is true, creates separate reservations for each business
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
 *                   properties:
 *                     id:
 *                       type: string
 *                     reservation_number:
 *                       type: string
 *                       example: BIZ-20250302-00001
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
 *     description: |
 *       Verifies pickup for items owned by the calling business.
 *       For reservations with items from multiple businesses:
 *       - Only verifies items owned by the calling business
 *       - Updates overall reservation status to COMPLETED only when all items are verified
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
 * /api/reservations/verify-by-number:
 *   post:
 *     tags: [Reservations]
 *     summary: Verify pickup using reservation number and confirmation code
 *     description: |
 *       Verifies pickup using a user-friendly reservation number instead of ID.
 *       Same behavior as the verify endpoint regarding multi-business reservations.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VerifyPickupByNumberRequest'
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
 *     description: |
 *       Returns detailed status information about a reservation.
 *       For multi-business reservations, includes status of items grouped by business.
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
 * /api/reservations/number/{reservationNumber}:
 *   get:
 *     tags: [Reservations]
 *     summary: Get reservation by reservation number
 *     description: Access reservation details using the user-friendly reservation number
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reservationNumber
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Reservation retrieved successfully
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
 *     description: |
 *       Returns reservations that include at least one item from the caller's business.
 *       For multi-business reservations, includes a flag indicating this is a shared reservation.
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
 *     description: |
 *       Returns comprehensive reservation details.
 *       For multi-business reservations, items are organized by business.
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
 *
 * /api/reservations/{reservationId}/cancel:
 *   post:
 *     tags: [Reservations]
 *     summary: Cancel a reservation
 *     description: |
 *       Allows cancellation with enhanced features:
 *       - Customers can only cancel PENDING reservations before payment
 *       - Businesses can cancel only their own items in any reservation
 *       - For multi-business reservations, only items owned by the caller are cancelled
 *       - Item quantities are returned to inventory
 *       - The overall reservation status is set to CANCELLED only if all items are cancelled
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
 *             type: object
 *             required:
 *               - cancellation_reason
 *             properties:
 *               cancellation_reason:
 *                 type: string
 *                 maxLength: 500
 *                 description: Reason for cancelling the reservation
 *                 example: "Changed my plans"
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
 *                   properties:
 *                     reservation:
 *                       type: object
 *                       description: Updated reservation details
 *                     cancelled_items:
 *                       type: integer
 *                       description: Number of items cancelled
 *                     total_items:
 *                       type: integer
 *                       description: Total items in the reservation
 *                     all_items_cancelled:
 *                       type: boolean
 *                       description: Whether all items were cancelled
 *       400:
 *         description: |
 *           Bad request scenarios:
 *           - Reservation already cancelled
 *           - Attempting to cancel a non-pending reservation as a customer
 *           - Attempting to cancel after payment as a customer
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
