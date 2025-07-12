import type { MetaFunction } from "@remix-run/node";
import { TetrisGame } from "~/components/TetrisGame";

export const meta: MetaFunction = () => {
  return [
    { title: "🌭 Glizztris" },
    { name: "description", content: "Can you claim the foot long glizzy throne?" },
  ];
};

export default function Index() {
  return <TetrisGame />;
}
