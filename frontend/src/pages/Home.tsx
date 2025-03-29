// MeetingRoomLanding.tsx
import useZustand from "@/zustand/useStore";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

interface RoomFormState {
  showJoinForm: boolean;
  roomCode: string;
}

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { setRoomCode, setHost } = useZustand();
  const [formState, setFormState] = useState<RoomFormState>({
    showJoinForm: false,
    roomCode: "",
  });

  const handleCreateRoom = () => {
    const newCode = Math.random().toString(36).substring(6);
    setRoomCode(newCode);
    setHost(true);
    console.log("creating new room with random generated code: ", newCode);
    navigate(`/room/${newCode}`);
  };

  const handleJoinRoom = () => {
    setRoomCode(formState.roomCode);
    console.log("Joining room with code:", formState.roomCode);
    navigate(`/room/${formState.roomCode}`);
  };

  const handleJoinButtonClick = () => {
    setFormState({
      ...formState,
      showJoinForm: true,
    });
  };

  const handleBackClick = () => {
    setFormState({
      ...formState,
      showJoinForm: false,
      roomCode: "",
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormState({
      ...formState,
      roomCode: e.target.value,
    });
  };

  return (
    <>
      {/* <Navbar /> */}

      {/* Main content area */}
      <div className="flex items-center justify-center min-h-screen bg-transparent">
        <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800">
              Welcome to Meeting Rooms
            </h1>
          </div>

          {!formState.showJoinForm ? (
            <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4 sm:justify-center">
              <button
                onClick={handleCreateRoom}
                className="px-6 py-3 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-200"
              >
                Create Room
              </button>
              <button
                onClick={handleJoinButtonClick}
                className="px-6 py-3 text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 transition duration-200"
              >
                Join Room
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <input
                type="text"
                value={formState.roomCode}
                onChange={handleInputChange}
                placeholder="Enter room code"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3 sm:justify-center">
                <button
                  onClick={handleJoinRoom}
                  className="px-6 py-2 text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 transition duration-200"
                >
                  Join
                </button>
                <button
                  onClick={handleBackClick}
                  className="px-6 py-2 text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 transition duration-200"
                >
                  Back
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Home;
