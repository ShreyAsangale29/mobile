import type { PoseId, PoseValidator } from "../types";
import { validateTree } from "./tree";
import { validateWarrior1 } from "./warrior-1";
import { validateWarrior2 } from "./warrior-2";
import { validateWarrior3 } from "./warrior-3";
import { validateCobra } from "./cobra";
import { validateBow } from "./bow";
import { validateArcher } from "./archer";
import { validateCamel } from "./camel";
import { validateShoulderStand } from "./shoulder-stand";
import { validateMountain } from "./mountain";
import { validateWindRelieving } from "./wind-relieving";
import { validateThunderbolt } from "./thunderbolt";
import { validateJumpingJacks } from "./jumpingjack";
import { validateArmCircles } from "./armrotation";
import { validateNeckRotation } from "./neckrotation";
import { validateShavasana } from "./corpsepose";
import { validateViparitaKarani } from "./leguptothewall";
import { validateSupineTwist } from "./supinespinetwist";

export const POSE_REGISTRY: Record<PoseId, PoseValidator> = {
  tree: validateTree,
  "warrior-1": validateWarrior1,
  "warrior-2": validateWarrior2,
  "warrior-3": validateWarrior3,
  cobra: validateCobra,
  bow: validateBow,
  archer: validateArcher,
  camel: validateCamel,
  "shoulder-stand": validateShoulderStand,
  mountain: validateMountain,
  "wind-relieving": validateWindRelieving,
  thunderbolt: validateThunderbolt,
  "jumping-jacks": validateJumpingJacks,
  "arm-circles": validateArmCircles,
  "neck-rotation": validateNeckRotation,
  shavasana: validateShavasana,
  "viparita-karani": validateViparitaKarani,
  "supine-twist": validateSupineTwist,
};

export interface PoseMeta {
  id: PoseId;
  label: string;
  sanskrit: string;
}

export const POSE_LIST: PoseMeta[] = [
  { id: "tree", label: "Tree Pose", sanskrit: "Vrikshasana" },
  { id: "warrior-1", label: "Warrior I", sanskrit: "Veerbhadrasana I" },
  { id: "warrior-2", label: "Warrior II", sanskrit: "Veerbhadrasana II" },
  { id: "warrior-3", label: "Warrior III", sanskrit: "Veerbhadrasana III" },
  { id: "cobra", label: "Cobra Pose", sanskrit: "Bhujangasana" },
  { id: "bow", label: "Bow Pose", sanskrit: "Dhanurasana" },
  { id: "archer", label: "Archer Pose", sanskrit: "Akarna Dhanurasana" },
  { id: "camel", label: "Camel Pose", sanskrit: "Ustrasana" },
  { id: "shoulder-stand", label: "Shoulder Stand", sanskrit: "Sarvangasana" },
  { id: "mountain", label: "Mountain Pose", sanskrit: "Tadasana" },
  { id: "wind-relieving", label: "Wind-Relieving Pose", sanskrit: "Pawanmuktasana" },
  { id: "thunderbolt", label: "Thunderbolt Pose", sanskrit: "Vajrasana" },
];
