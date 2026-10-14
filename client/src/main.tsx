import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

const root = document.getElementById("root");
if (!root) throw new Error("SkillPass could not find its application root.");
createRoot(root).render(<App />);
