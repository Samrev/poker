import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CreateRoomModalProps } from "../../types";
import { createRoom, joinRoom } from "../../api/room";

const CreateRoomModal: React.FC<CreateRoomModalProps> = ({ handleCancelCreateRoom, guestId }) => {
  const [numPlayers, setNumPlayers] = useState<string>('');
  const navigate = useNavigate();
  const handleCreateRoom = async () => {
    const roomId = await createRoom(Number(numPlayers));
    if(!roomId){
      throw Error("Room creation failed");
    }
    const res = await joinRoom(roomId, guestId);
    if(res && res.status === 200){
      navigate(`/room/${roomId}`);
      handleCancelCreateRoom();
    }
    else{
      throw Error("Room joining failed");
    }
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h3>Create Room</h3>
        <input
          type="number"
          placeholder="Number of Players"
          value={numPlayers} // This will be empty initially
          onChange={(e) => setNumPlayers(e.target.value)} // Set as string to handle empty input
        />
        <div className="modal-actions">
          <button onClick={handleCreateRoom}>Create</button>
          <button onClick={handleCancelCreateRoom}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default CreateRoomModal;
