import Player from "../models/player.js";


const incrementHexId = (hexId) => {
    const idAsNumber = parseInt(hexId, 16) + 1; 
    const newHexId = idAsNumber.toString(16).toUpperCase(); 
    return newHexId.padStart(6, '0'); 
};


export const createGuest = async (req, res) => {
    try {
        console.log("creating guest")
        const lastPlayer = await Player.findOne({}).sort({ guestId: -1 }).limit(1).exec();
        let newGuestId = "000001"; 
        if (lastPlayer) {
            newGuestId = incrementHexId(lastPlayer.guestId);
        }
        const newPlayer = new Player({ guestId: newGuestId });
        await newPlayer.save();
        res.status(201).json({ guestId: newGuestId });

    } catch (error) {
        console.error("Failed to create guest", error);
        res.status(500).json({ error: "Failed to create guest" });
    }
};
