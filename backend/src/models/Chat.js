import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    role: { type: String, enum: ["user", "assistant", "system"], required: true },
    content: { type: String, required: true },
    data: { type: Object }, // For storing prices, gas, etc.
    timestamp: { type: Date, default: Date.now },
});

const chatSchema = new mongoose.Schema({
    walletAddress: { type: String, required: true, index: true },
    agentId: { type: String, default: "chainmind", index: true },
    title: { type: String, required: true },
    messages: [messageSchema],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

// Update title based on the first user message if not set
chatSchema.pre("save", function (next) {
    this.updatedAt = Date.now();
    if (!this.title && this.messages.length > 0) {
        const firstUserMsg = this.messages.find(m => m.role === "user");
        if (firstUserMsg) {
            this.title = firstUserMsg.content.substring(0, 40) + (firstUserMsg.content.length > 40 ? "..." : "");
        }
    }
    next();
});

const Chat = mongoose.model("Chat", chatSchema);

export default Chat;
