// src/docs/reservation.doc.ts

/**
 * @swagger
 * tags:
 *   name: Reservations
 *   description: Reservation management endpoints
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Reservation:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         customer_id:
 *           type: string
 *           format: uuid
 *         listing_id:
 *           type: string
 *           format: uuid
 *         status:
 *           type: string
 *           enum: [PENDING, CONFIRMED, COMPLETED, CANCELLED]
 *         pickup_time:
 *           type: string
 *           format: date-time
 *         cancellation_reason:
 *           type: string
 *         confirmation_code:
 *           type: string
 *         pickup_confirmed_at:
 *           type: string
 *           format: date-time
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *         listing:
 *           $ref: '#/components/schemas/FoodListing'
 *         customer:
 *           $ref: '#/components/schemas/Customer'
 *         payment_transactions:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/PaymentTransaction'
 *         review:
 *           $ref: '#/components/schemas/Review'
 *         is_paid:
 *           type: boolean
 *         is_pickup_time:
 *           type: boolean
 *         can_cancel:
 *           type: boolean
 *         time_remaining:
 *           type: number
 *         formatted_pickup_time:
 *           type: string
 *
 *     ReservationCreate:
 *       type: object
 *       required:
 *         - listing_id
 *         - pickup_time
 *       properties:
 *         listing_id:
 *           type: string
 *           format: uuid
 *         pickup_time:
 *           type: string
 *           format: date-time
 *
 *     PaymentProcess:
 *       type: object
 *       required:
 *         - amount
 *         - currency
 *         - payment_method
 *       properties:
 *         amount:
 *           type: number
 *           format: float
 *         currency:
 *           type: string
 *           example: "USD"
 *         payment_method:
 *           type: string
 *           enum: [CREDIT_CARD, DEBIT_CARD, PAYPAL]
 *
 *     ReservationQR:
 *       type: object
 *       properties:
 *         qr_code:
 *           type: string
 *         confirmation_code:
 *           type: string
 *         reservation_status:
 *           type: string
 *         pickup_time:
 *           type: string
 *           format: date-time
 *         business_name:
 *           type: string
 *         listing_title:
 *           type: string
 *         is_expired:
 *           type: boolean
 *         is_valid:
 *           type: boolean
 *         formatted_pickup_time:
 *           type: string
 *
 *     ReservationStatus:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           enum: [PENDING, CONFIRMED, COMPLETED, CANCELLED]
 *         is_paid:
 *           type: boolean
 *         pickup_time:
 *           type: string
 *           format: date-time
 *         pickup_confirmed_at:
 *           type: string
 *           format: date-time
 *         has_qr_code:
 *           type: boolean
 *         payment_status:
 *           type: string
 *           enum: [PENDING, PAID]
 */

/**
 * @swagger
 * /api/reservations:
 *   post:
 *     summary: Create a new reservation
 *     description: |
 *       Create a new reservation for a food listing. Only available for customers.
 *
 *       The reservation will be created with a PENDING status initially.
 *       Payment must be processed separately after creation.
 *
 *       Business rules:
 *       - Pickup time must be within the listing's pickup window
 *       - Customer cannot have multiple active reservations for the same listing
 *       - Listing must be available and have sufficient quantity
 *       - Pickup time cannot be in the past
 *     tags: [Reservations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ReservationCreate'
 *           example:
 *             listing_id: "550e8400-e29b-41d4-a716-446655440000"
 *             pickup_time: "2025-02-11T15:30:00Z"
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
 *                   $ref: '#/components/schemas/Reservation'
 *             example:
 *               status: "success"
 *               data:
 *                 id: "123e4567-e89b-12d3-a456-426614174000"
 *                 customer_id: "abc123-user-id-example"
 *                 listing_id: "550e8400-e29b-41d4-a716-446655440000"
 *                 status: "PENDING"
 *                 pickup_time: "2025-02-11T15:30:00Z"
 *                 created_at: "2025-02-11T10:30:00Z"
 *                 updated_at: "2025-02-11T10:30:00Z"
 *                 listing:
 *                   id: "550e8400-e29b-41d4-a716-446655440000"
 *                   title: "Fresh Sushi Platter"
 *                   price: 15.99
 *                   original_price: 29.99
 *                   quantity: 5
 *                   business:
 *                     id: "789e0123-b45c-67d8-e901-234567890000"
 *                     company_name: "Sushi Express"
 *                     is_verified: true
 *                   location:
 *                     address: "123 Food St"
 *                     city: "Foodville"
 *                     postal_code: "12345"
 *                 is_paid: false
 *                 can_cancel: true
 *                 time_remaining: 18000000
 *                 formatted_pickup_time: "Feb 11, 2025, 3:30 PM"
 *       400:
 *         description: Invalid input or business validation error
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
 *             examples:
 *               invalidListing:
 *                 value:
 *                   status: "error"
 *                   message: "Food listing not found"
 *               unavailableListing:
 *                 value:
 *                   status: "error"
 *                   message: "Food listing is not available"
 *               invalidPickupTime:
 *                 value:
 *                   status: "error"
 *                   message: "Pickup time must be within the listing's pickup window"
 *               pastPickupTime:
 *                 value:
 *                   status: "error"
 *                   message: "Pickup time cannot be in the past"
 *               existingReservation:
 *                 value:
 *                   status: "error"
 *                   message: "You already have an active reservation for this listing"
 *               invalidInput:
 *                 value:
 *                   status: "error"
 *                   message: "Invalid input data: listing_id is required"
 *       401:
 *         description: Not authorized - Missing or invalid authentication token
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
 *             example:
 *               status: "error"
 *               message: "Not authorized to access this route"
 *       403:
 *         description: Forbidden - User role is not customer
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
 *             example:
 *               status: "error"
 *               message: "User role not authorized to access this route"
 *     x-codeSamples:
 *       - lang: 'JavaScript'
 *         source: |
 *           const response = await fetch('http://api.example.com/api/reservations', {
 *             method: 'POST',
 *             headers: {
 *               'Authorization': 'Bearer YOUR_TOKEN',
 *               'Content-Type': 'application/json'
 *             },
 *             body: JSON.stringify({
 *               listing_id: "550e8400-e29b-41d4-a716-446655440000",
 *               pickup_time: "2025-02-11T15:30:00Z"
 *             })
 *           });
 *
 *           const data = await response.json();
 *       - lang: 'cURL'
 *         source: |
 *           curl -X POST \
 *             http://api.example.com/api/reservations \
 *             -H 'Authorization: Bearer YOUR_TOKEN' \
 *             -H 'Content-Type: application/json' \
 *             -d '{
 *               "listing_id": "550e8400-e29b-41d4-a716-446655440000",
 *               "pickup_time": "2025-02-11T15:30:00Z"
 *             }'
 */
/**
 * @swagger
 * /api/reservations/{reservationId}/payment:
 *   post:
 *     summary: Process payment for a reservation
 *     description: Process payment and generate QR code for a pending reservation. Only available for customers.
 *     tags: [Reservations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reservationId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The reservation ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PaymentProcess'
 *     responses:
 *       200:
 *         description: Payment processed successfully
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
 *                     payment:
 *                       $ref: '#/components/schemas/PaymentTransaction'
 *                     reservation:
 *                       $ref: '#/components/schemas/Reservation'
 *                     qr_code:
 *                       type: string
 *                     confirmation_code:
 *                       type: string
 *       400:
 *         description: Invalid payment data or reservation status
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Forbidden - not a customer
 *       404:
 *         description: Reservation not found
 *
 * /api/reservations/{reservationId}/qr:
 *   get:
 *     summary: Get QR code for a reservation
 *     description: Get the QR code for a confirmed reservation. Available for both customers and businesses.
 *     tags: [Reservations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reservationId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The reservation ID
 *     responses:
 *       200:
 *         description: QR code retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/ReservationQR'
 *       400:
 *         description: Invalid reservation status or payment not completed
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Forbidden - not authorized for this reservation
 *       404:
 *         description: Reservation not found
 *
 * /api/reservations/{reservationId}/verify:
 *   post:
 *     summary: Verify pickup using QR code
 *     description: Verify pickup using confirmation code from QR code. Only available for businesses.
 *     tags: [Reservations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reservationId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The reservation ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - confirmation_code
 *             properties:
 *               confirmation_code:
 *                 type: string
 *     responses:
 *       200:
 *         description: Pickup verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/Reservation'
 *       400:
 *         description: Invalid confirmation code or reservation status
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Forbidden - not a business
 *       404:
 *         description: Reservation not found
 * */
/**
 * @swagger
 * /api/reservations/{reservationId}/status:
 *   get:
 *     summary: Get reservation status
 *     description: Get detailed status information for a reservation. Available for both customers and businesses.
 *     tags: [Reservations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reservationId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The reservation ID
 *     responses:
 *       200:
 *         description: Status retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/ReservationStatus'
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Forbidden - not authorized for this reservation
 *       404:
 *         description: Reservation not found
 *
 *   patch:
 *     summary: Update reservation status
 *     description: Update the status of a reservation. Available for both customers and businesses with role-specific restrictions.
 *     tags: [Reservations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reservationId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The reservation ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [CONFIRMED, COMPLETED, CANCELLED]
 *               cancellation_reason:
 *                 type: string
 *                 description: Required when status is CANCELLED
 *     responses:
 *       200:
 *         description: Status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/Reservation'
 *       400:
 *         description: Invalid status transition or missing cancellation reason
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Forbidden - not authorized for this reservation
 *       404:
 *         description: Reservation not found
 *
 * /api/reservations/{reservationId}:
 *   get:
 *     summary: Get reservation details
 *     description: Get complete details of a reservation. Available for both customers and businesses.
 *     tags: [Reservations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reservationId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The reservation ID
 *     responses:
 *       200:
 *         description: Reservation details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/Reservation'
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Forbidden - not authorized for this reservation
 *       404:
 *         description: Reservation not found
 * */
/**
 * @swagger
 * /api/reservations/business/reservations:
 *   get:
 *     summary: Get business reservations
 *     description: Get all reservations for the authenticated business with filters and pagination. Business only endpoint.
 *     tags: [Reservations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, CONFIRMED, COMPLETED, CANCELLED]
 *         description: Filter by reservation status
 *       - in: query
 *         name: from_date
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter by pickup time starting from this date
 *       - in: query
 *         name: to_date
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter by pickup time until this date
 *     responses:
 *       200:
 *         description: List of business reservations retrieved successfully
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
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Reservation'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                           description: Total number of reservations
 *                           example: 50
 *                         page:
 *                           type: integer
 *                           description: Current page number
 *                           example: 1
 *                         limit:
 *                           type: integer
 *                           description: Items per page
 *                           example: 10
 *                         total_pages:
 *                           type: integer
 *                           description: Total number of pages
 *                           example: 5
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Forbidden - not a business account
 *
 * /api/reservations/customer/reservations:
 *   get:
 *     summary: Get customer reservations
 *     description: Get all reservations for the authenticated customer with filters and pagination. Customer only endpoint.
 *     tags: [Reservations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, CONFIRMED, COMPLETED, CANCELLED]
 *         description: Filter by reservation status
 *       - in: query
 *         name: from_date
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter by pickup time starting from this date
 *       - in: query
 *         name: to_date
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter by pickup time until this date
 *     responses:
 *       200:
 *         description: List of customer reservations retrieved successfully
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
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Reservation'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                           description: Total number of reservations
 *                           example: 50
 *                         page:
 *                           type: integer
 *                           description: Current page number
 *                           example: 1
 *                         limit:
 *                           type: integer
 *                           description: Items per page
 *                           example: 10
 *                         total_pages:
 *                           type: integer
 *                           description: Total number of pages
 *                           example: 5
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Forbidden - not a customer account
 *
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *       description: JWT Authorization header using the Bearer scheme
 */
/**
 * @swagger
 * components:
 *   schemas:
 *     PaymentTransaction:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         reservation_id:
 *           type: string
 *           format: uuid
 *         amount:
 *           type: number
 *           format: float
 *         currency:
 *           type: string
 *           example: "USD"
 *         status:
 *           type: string
 *           enum: [PENDING, COMPLETED, FAILED]
 *         payment_method:
 *           type: string
 *           enum: [CREDIT_CARD, DEBIT_CARD, PAYPAL]
 *         transaction_id:
 *           type: string
 *         created_at:
 *           type: string
 *           format: date-time
 *
 *     Review:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         customer_id:
 *           type: string
 *           format: uuid
 *         business_id:
 *           type: string
 *           format: uuid
 *         listing_id:
 *           type: string
 *           format: uuid
 *         reservation_id:
 *           type: string
 *           format: uuid
 *         rating:
 *           type: integer
 *           minimum: 1
 *           maximum: 5
 *         comment:
 *           type: string
 *         created_at:
 *           type: string
 *           format: date-time
 *         images:
 *           type: array
 *           items:
 *             type: string
 *
 *     Customer:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         first_name:
 *           type: string
 *         last_name:
 *           type: string
 *         address:
 *           type: string
 *         birth_date:
 *           type: string
 *           format: date-time
 *         profile_picture:
 *           type: string
 *         user:
 *           type: object
 *           properties:
 *             email:
 *               type: string
 *             phone:
 *               type: string
 *             is_verified:
 *               type: boolean
 *
 *     FoodListing:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         business_id:
 *           type: string
 *           format: uuid
 *         location_id:
 *           type: string
 *           format: uuid
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         price:
 *           type: number
 *           format: float
 *         original_price:
 *           type: number
 *           format: float
 *         quantity:
 *           type: integer
 *         unit:
 *           type: string
 *         expiry_date:
 *           type: string
 *           format: date-time
 *         pickup_start:
 *           type: string
 *           format: date-time
 *         pickup_end:
 *           type: string
 *           format: date-time
 *         status:
 *           type: string
 *           enum: [AVAILABLE, UNAVAILABLE, SOLD]
 *         images:
 *           type: array
 *           items:
 *             type: string
 *         is_halal:
 *           type: boolean
 *         preparation_time:
 *           type: string
 *         storage_instructions:
 *           type: string
 *         business:
 *           $ref: '#/components/schemas/Business'
 *         location:
 *           $ref: '#/components/schemas/Location'
 *
 *     Business:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         company_name:
 *           type: string
 *         legal_name:
 *           type: string
 *         tax_number:
 *           type: string
 *         business_license:
 *           type: string
 *         business_type:
 *           type: string
 *         registration_number:
 *           type: string
 *         is_verified:
 *           type: boolean
 *         verification_documents:
 *           type: string
 *         logo:
 *           type: string
 *         website:
 *           type: string
 *         working_hours:
 *           type: string
 *
 *     */
