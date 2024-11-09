import React, { useState } from "react";
import { EnterRoomModalProps } from "../../types";
import { useNavigate } from "react-router-dom";
import { joinRoom } from "../../api/room";

const EnterRoomModal: React.FC<EnterRoomModalProps> = ({
  handleCancelEnterRoom,
  guestId,
}) => {
  const [roomId, setRoomId] = useState<string>("");
  const navigate = useNavigate();
  const handleEnterRoom = async () => {
    const res = await joinRoom(roomId, guestId);
    if (res && res.status === 200) {
      navigate(`/room`, {
        state: {
          roomId,
          guestId,
        },
      });
      handleCancelEnterRoom();
    }
  };
  return (
    <div className="modal">
      <div className="modal-content">
        <h3>Enter Room</h3>
        <input
          type="text"
          placeholder="Room ID"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
        />
        <div className="modal-actions">
          <button onClick={handleEnterRoom}>Enter</button>
          <button onClick={handleCancelEnterRoom}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default EnterRoomModal;
