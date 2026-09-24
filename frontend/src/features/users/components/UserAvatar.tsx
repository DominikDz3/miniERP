const COLORS = [
  "bg-blue-500", "bg-green-500", "bg-purple-500",
  "bg-amber-500", "bg-rose-500", "bg-teal-500",
];

function initials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return fullName.slice(0, 2).toUpperCase();
}

function colorFor(seed: string): string {
  let sum = 0;
  for (let i = 0; i < seed.length; i++) sum += seed.charCodeAt(i);
  return COLORS[sum % COLORS.length];
}

export function UserAvatar({ fullName, username }: { fullName: string; username: string }) {
  return (
    <div className={`flex items-center justify-center w-9 h-9 rounded-full text-white text-xs font-semibold ${colorFor(username)}`}>
      {initials(fullName)}
    </div>
  );
}