import mongoose from "mongoose";

const playerSchema = new mongoose.Schema({
    guestId: { type: String, required: true, unique: true },
    isPlaying: { type: Boolean, default: false },
    room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', default: null },
  });

const Player = mongoose.model('Player', playerSchema);
export default Player;