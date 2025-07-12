import { MetaFunction } from "@remix-run/node";
import { TetrisGame } from "~/components/TetrisGame";

export const meta: MetaFunction = () => {
  return [
    { title: "🌭 Glizztris" },
    { name: "description", content: "Can you claim the foot long glizzy throne?" },
  ];
};

export default function Glizztris() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-100 via-yellow-50 to-red-100 p-2">
      <div className="max-w-sm mx-auto">
        <div className="text-center mb-4">
          <h1 className="text-3xl font-bold text-orange-800 mb-1">
            🌭 Glizztris
          </h1>
          <p className="text-sm text-orange-600 font-medium">
            Can you claim the foot long glizzy throne?
          </p>
        </div>
        
        <TetrisGame />
      </div>
    </div>
  );
}