import useZustand from "@/zustand/useStore";
import ProfileSection from "./ProfileSection";

const Navbar = () => {
  const { nickname, setNickname } = useZustand();
  return (
    <div>
      {/* Top navigation bar with profile in the corner */}
      <div className="text-white shadow-sm bg-transparent border-b border-blue-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-semibold">CODE NAME</h1>

            {/* Profile section positioned in the top right corner */}
            {nickname.length > 0 && (
              <ProfileSection
                initialNickname={nickname}
                onNicknameUpdate={setNickname}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
