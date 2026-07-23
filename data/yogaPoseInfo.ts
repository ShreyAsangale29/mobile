// data/yogaPoseInfo.ts
//
// Full info for all 12 yoga poses, used by the pre-workout preview screen.
// Keyed by the SAME pose ids used in data/yogaData.ts / lib/pose-engine's
// POSE_LIST (tree, warrior-1, mountain, etc.) — NOT the Sanskrit slugs the
// image files happen to be named after. This is what fixed the "wrong/no
// image, same generic steps for every pose" bug: the previous version was
// keyed by Sanskrit-slug ids that never matched what actually gets passed
// through ?poses=... from the yoga selection screen.
//
// `englishName` is set to exactly match yogaData.ts's `name` field for each
// pose, so the name shown here is identical to what's shown on the live
// session screen later.

export type YogaPoseInfo = {
  id: string;
  englishName: string;
  sanskritName: string;
  category: "Standing" | "Sitting" | "Lay Down";
  info: string;
  steps: string[];
  image: any;
};

export const yogaPoseInfo: Record<string, YogaPoseInfo> = {
  mountain: {
    id: "mountain",
    englishName: "Mountain Pose",
    sanskritName: "Tadasana",
    category: "Standing",
    info: "A foundational standing pose that improves posture and body awareness.",
    steps: [
      "Stand with feet together or hip-width apart.",
      "Distribute your weight evenly across both feet.",
      "Engage your thighs and lengthen your spine upward.",
      "Relax your shoulders down, arms resting alongside your body.",
    ],
    image: require("../assets/images/yoga/tadasana.png"),
  },
  tree: {
    id: "tree",
    englishName: "Tree Pose",
    sanskritName: "Vrikshasana",
    category: "Standing",
    info: "A standing balance pose that builds focus, stability, and leg strength.",
    steps: [
      "Stand tall and shift your weight onto one leg.",
      "Place the sole of your other foot on your inner calf or thigh — not on the knee.",
      "Bring your hands together at your chest, or extend them overhead.",
      "Fix your gaze on a point ahead to help hold your balance.",
    ],
    image: require("../assets/images/yoga/vrikshasana.png"),
  },
  "warrior-1": {
    id: "warrior-1",
    englishName: "Warrior I",
    sanskritName: "Virbhadrasana I",
    category: "Standing",
    info: "A standing lunge pose that builds leg strength and opens the hips and chest.",
    steps: [
      "Step one foot back into a long stride, back foot turned slightly outward.",
      "Bend your front knee until it's over your front ankle.",
      "Square your hips and chest toward the front of the mat.",
      "Raise both arms overhead, palms facing each other.",
    ],
    image: require("../assets/images/yoga/virbhadrasana-i.png"),
  },
  "warrior-2": {
    id: "warrior-2",
    englishName: "Warrior II",
    sanskritName: "Virbhadrasana II",
    category: "Standing",
    info: "A wide-legged standing pose that builds leg strength while opening the hips.",
    steps: [
      "Step your feet wide apart, front foot forward, back foot turned slightly in.",
      "Bend your front knee over your ankle, keeping your back leg straight.",
      "Extend your arms parallel to the floor, reaching in opposite directions.",
      "Turn your gaze over your front hand.",
    ],
    image: require("../assets/images/yoga/virbhadrasana-ii.png"),
  },
  "warrior-3": {
    id: "warrior-3",
    englishName: "Warrior III",
    sanskritName: "Virbhadrasana III",
    category: "Standing",
    info: "A challenging one-legged balance pose that builds core strength and stability.",
    steps: [
      "From standing, hinge forward while lifting one leg straight back.",
      "Keep your hips level and your torso roughly parallel to the floor.",
      "Extend your arms forward or alongside your body.",
      "Fix your gaze on a steady point ahead to help you balance.",
    ],
    image: require("../assets/images/yoga/virbhadrasana-iii.png"),
  },
  archer: {
    id: "archer",
    englishName: "Archer Pose",
    sanskritName: "Akarna Dhanurasana",
    category: "Sitting",
    info: "A seated pose that stretches the hamstrings and shoulders, resembling drawing a bow.",
    steps: [
      "Sit with both legs extended forward.",
      "Hold one big toe with the same-side hand and the other foot with the opposite hand.",
      "Bend the holding-side knee and draw that foot toward your ear.",
      "Keep the extended leg straight and grounded throughout.",
    ],
    image: require("../assets/images/yoga/akarna-dhanurasana.png"),
  },
  camel: {
    id: "camel",
    englishName: "Camel Pose",
    sanskritName: "Ushtrasana",
    category: "Sitting",
    info: "A kneeling backbend that opens the chest, shoulders, and hip flexors.",
    steps: [
      "Kneel with your hips stacked over your knees, thighs vertical.",
      "Place your hands on your lower back for support.",
      "Lift your chest and gently arch backward.",
      "If comfortable, reach your hands back to hold your heels.",
    ],
    image: require("../assets/images/yoga/ushtrasana.png"),
  },
  thunderbolt: {
    id: "thunderbolt",
    englishName: "Thunderbolt Pose",
    sanskritName: "Vajrasana",
    category: "Sitting",
    info: "A simple kneeling seated pose often used for meditation and aiding digestion.",
    steps: [
      "Kneel down and sit back onto your heels.",
      "Keep your spine tall and your shoulders relaxed.",
      "Rest your hands on your thighs.",
      "Breathe steadily while holding the position.",
    ],
    image: require("../assets/images/yoga/vajrasana.png"),
  },
  cobra: {
    id: "cobra",
    englishName: "Cobra Pose",
    sanskritName: "Bhujangasana",
    category: "Lay Down",
    info: "A gentle backbend performed lying face down that strengthens the spine and opens the chest.",
    steps: [
      "Lie face down with your hands under your shoulders.",
      "Press the tops of your feet into the floor.",
      "Inhale and lift your chest by straightening your arms.",
      "Keep your elbows slightly bent and shoulders away from your ears.",
    ],
    image: require("../assets/images/yoga/bhujangasana.png"),
  },
  bow: {
    id: "bow",
    englishName: "Bow Pose",
    sanskritName: "Dhanurasana",
    category: "Lay Down",
    info: "A deep backbend where the body forms the shape of a bow, opening the entire front body.",
    steps: [
      "Lie face down and bend both knees.",
      "Reach back to hold your ankles with your hands.",
      "Inhale and lift your chest and thighs off the floor together.",
      "Hold the pose steadily while breathing evenly.",
    ],
    image: require("../assets/images/yoga/dhanurasana.png"),
  },
  "wind-relieving": {
    id: "wind-relieving",
    englishName: "Wind-Relieving Pose",
    sanskritName: "Pavanmukhasana",
    category: "Lay Down",
    info: "A supine pose that gently compresses the abdomen and stretches the lower back.",
    steps: [
      "Lie on your back with your legs extended.",
      "Draw one or both knees toward your chest.",
      "Clasp your hands around your shins.",
      "Hold while keeping your lower back grounded on the mat.",
    ],
    image: require("../assets/images/yoga/pavanmukhasana.png"),
  },
  "shoulder-stand": {
    id: "shoulder-stand",
    englishName: "Shoulder Stand",
    sanskritName: "Sarvangasana",
    category: "Lay Down",
    info: "An inversion that improves circulation and strengthens the shoulders and core.",
    steps: [
      "Lie on your back and lift your legs overhead.",
      "Support your lower back with your hands, elbows grounded on the mat.",
      "Straighten your body upward, balancing on your shoulders.",
      "Keep your legs active and your gaze steady.",
    ],
    image: require("../assets/images/yoga/sarvangasana.png"),
  },
};

export const GENERIC_YOGA_POSE_INFO: YogaPoseInfo = {
  id: "unknown",
  englishName: "Yoga Pose",
  sanskritName: "",
  category: "Standing",
  info: "Hold this pose with steady, even breathing while keeping proper alignment.",
  steps: [
    "Move into the pose slowly and with control.",
    "Check your alignment against the on-screen guidance.",
    "Hold the position while breathing steadily.",
    "Release the pose slowly when your hold time ends.",
  ],
  image: undefined,
};

export function getYogaPoseInfo(id: string): YogaPoseInfo {
  return yogaPoseInfo[id] ?? { ...GENERIC_YOGA_POSE_INFO, id, englishName: id };
}

export const YOGA_POSE_LIST: YogaPoseInfo[] = Object.values(yogaPoseInfo); 