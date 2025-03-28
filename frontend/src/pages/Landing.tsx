// NameEntryComponent.tsx
import useZustand from "@/zustand/useStore";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

interface NameFormState {
  NickName: string;
}

const Landing: React.FC = () => {
  const navigate = useNavigate();
  const { setNickname, users } = useZustand();
  const [formState, setFormState] = useState<NameFormState>({ NickName: "" });
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormState({
      ...formState,
      NickName: e.target.value,
    });
  };

  const handleEnter = () => {
    users.map((u) => {
      if (u === formState.NickName) {
        alert("this name is already taken, enter different name");
        setFormState({ ...formState, NickName: "" });
        return;
      }
    });
    console.log("Entered with name:", formState.NickName);
    setNickname(formState.NickName);
    navigate("/home");
  };

  return (
    <>
      {/* <Navbar /> */}

      {/* Main content area */}
      <div className="flex items-center justify-center min-h-screen bg-transparent">
        <div className="bg-gray-100 rounded-lg">
          <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-800">Welcome</h1>
            </div>

            <div className="space-y-4">
              <input
                type="text"
                value={formState.NickName}
                onChange={handleInputChange}
                placeholder="Enter your name"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />

              <div className="flex justify-center">
                <button
                  onClick={handleEnter}
                  disabled={!formState.NickName?.trim()}
                  className="px-6 py-3 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Enter
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Landing;
