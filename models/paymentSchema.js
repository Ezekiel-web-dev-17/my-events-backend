import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true,
    },
    event: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Eventra" // ⬅️ FIX: Use the correct Event model name
    },
    email:{
        type:String,
        required:true  
    },
    firstname:{
        type:String,
        required:true
    },
    lastname:{
        type:String,
        required:true
    },
    ticket: { 
        // ⬅️ CRITICAL FIX: The ID references an EMBEDDED subdocument. Remove 'ref'.
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    ticketInstances: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "TicketInstance", 
    }],
    quantity:{
        type:Number,
        required:true,
        default:1
    },
    reference: {
        type: String,
        unique: true,
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        enum: ["pending","processing", "success", "failed"],
        default: "pending",
    },
    paidAt: Date,
    gatewayResponse: Object,
    authorizationUrl: { type: String }, // Stored on init for idempotency replay
    processingStartedAt: Date,
}, { timestamps: true });

// DB-level enforcer: only ONE pending payment allowed per user+ticket at a time.
// The partial filter means the uniqueness constraint ONLY applies while status === "pending".
// Once a payment resolves (success/failed), the slot is freed and the user can repurchase.
paymentSchema.index(
  { user: 1, ticket: 1 },
  {
    unique: true,
    partialFilterExpression: { status: "pending" },
    name: "unique_pending_payment_per_user_ticket",
  }
);

const PAYMENT = mongoose.model("ticketPayment", paymentSchema);
export default PAYMENT;