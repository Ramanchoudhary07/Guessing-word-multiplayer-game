// ProfileSection.tsx
import React, { useState, useRef, useEffect } from "react";

interface ProfileSectionProps {
  initialNickname: string;
  onNicknameUpdate?: (newNickname: string) => void;
}

const ProfileSection: React.FC<ProfileSectionProps> = ({
  initialNickname,
  onNicknameUpdate,
}) => {
  const [nickname, setNickname] = useState<string>(initialNickname);
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [newNickname, setNewNickname] = useState<string>("");
  const menuRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Handle clicks outside of the menu to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    if (isEditing) {
      setIsEditing(false);
    }
  };

  const handleUpdateClick = () => {
    setIsEditing(true);
    setNewNickname(nickname);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewNickname(e.target.value);
  };

  const handleSubmit = () => {
    if (newNickname.trim()) {
      setNickname(newNickname);
      if (onNicknameUpdate) {
        onNicknameUpdate(newNickname);
      }
      setIsEditing(false);
      setIsMenuOpen(false);
    }
  };

  // Get initials for the profile avatar
  const getInitials = () => {
    return nickname
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="relative text-white">
      {/* Profile Circle */}
      <div
        ref={profileRef}
        onClick={toggleMenu}
        className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center cursor-pointer hover:bg-blue-700 transition-colors duration-200 select-none"
      >
        {getInitials()}
      </div>

      {/* Dropdown Menu */}
      {isMenuOpen && (
        <div
          ref={menuRef}
          className="absolute right-0 mt-2 w-48 bg-black border  text-white rounded-md shadow-lg z-10"
        >
          {!isEditing ? (
            <div className="py-1">
              <div className="px-4 py-2 text-md font-bold border-b border-gray-200">
                {nickname}
              </div>
              <button
                onClick={handleUpdateClick}
                className="block w-full text-left px-4 py-2 text-md hover:bg-black/65"
              >
                Update Nickname
              </button>
            </div>
          ) : (
            <div className="p-3 space-y-3">
              <input
                type="text"
                value={newNickname}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border text-black border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                placeholder="Enter new nickname"
                autoFocus
              />
              <button
                onClick={handleSubmit}
                disabled={!newNickname.trim()}
                className="w-full px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Enter
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProfileSection;
