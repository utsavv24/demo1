# Security Specification: Kashyap Pharmacy

## Data Invariants
1. Products catalog: Products can be browsed and read by any customer or guest. Creation, updates, and deletion are strictly reserved for verified administrators (`isAdmin()`).
2. User Profiles (`users/{userId}`): PII protection is enforced. Users may only read and edit their own profile document (`userId == request.auth.uid`). Users cannot grant themselves the `admin` role; `role` changes are restricted to admin privileges.
3. Orders (`orders/{orderId}`): Authenticated customers can create an order matching their own `userId`. Customers can read and list their own orders. Only administrators can update the order status (`Approved`, `Dispatched`, `Delivered`) or verify prescriptions.
4. Prescriptions (`prescriptions/{prescriptionId}`): Customers can upload prescriptions with their own `userId`. Only the owning customer and administrators can view the prescription file/record. Only administrators can update the prescription verification `status`.
5. Administrator Bootstrapping: The system recognizes `utsavkashyap258@gmail.com` as the verified administrator, along with entries in the `/admins/{adminId}` collection.

## Dirty Dozen Payloads (Rejection Matrix)
1. **Unauthenticated Product Injection**: Attempt by unauthenticated actor to create a fake product in `/products/{productId}` -> REJECTED (auth required + admin check).
2. **Customer Admin Role Escalation**: Attempt by standard customer to update `role: "admin"` in `/users/{uid}` -> REJECTED (cannot change role without admin role).
3. **Ghost / Shadow Field Injection**: Updating order with unauthorized field `tamperedFlag: true` -> REJECTED (strict keys / diff guard).
4. **Order Impersonation on Create**: Customer A creating an order with `userId: "Customer_B_ID"` -> REJECTED (`incoming().userId == request.auth.uid`).
5. **Unauthorized Order Status Elevation**: Customer attempting to change their own order `status` from `Pending` to `Delivered` without admin rights -> REJECTED (`isAdmin()` required for status progression).
6. **Cross-User Order Reading**: Customer A querying or reading Customer B's order document -> REJECTED (`resource.data.userId == request.auth.uid || isAdmin()`).
7. **Cross-User Prescription Reading**: Customer A attempting to access Customer B's medical prescription in `/prescriptions/{id}` -> REJECTED (`resource.data.userId == request.auth.uid || isAdmin()`).
8. **Malicious ID Poisoning**: Document ID exceeding 128 characters or containing illegal regex characters -> REJECTED (`isValidId()`).
9. **Unverified Email Admin Spoofing**: Attempt to act as admin with `email: "utsavkashyap258@gmail.com"` but `email_verified == false` -> REJECTED (verified email invariant).
10. **Product Tampering without Admin Privileges**: Standard customer attempting to update medicine price from $50 to $0.01 -> REJECTED (`isAdmin()` required for product writes).
11. **Negative Price / Massive String DOS**: Product creation with negative price or description over 50,000 characters -> REJECTED (volumetric and range constraints).
12. **Prescription Status Tampering**: Customer updating their own prescription status to `Approved` -> REJECTED (only admin can change review status).
