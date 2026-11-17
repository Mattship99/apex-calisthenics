export const MASTER_PATHWAYS = [
  {
    id: 'inversion-master',
    title: 'Inversion & Overhead Master',
    category: 'Advanced',
    description: 'Master handstands, wrist conditioning, pressing mechanics, and freestanding balance.',
    badge: 'Inversion Master',
    levels1to5Title: 'Phase 1: Handstand Foundations',
    levels6to10Title: 'Phase 2: Vertical Pressing & HSPU',
    levels1to5: [
      { level: 1, name: 'Wrist Conditioning & Tabletop Decompressions', target: '3 x 30s', cues: ['Keep palms flat', 'Distribute weight evenly across fingers'], pitfalls: ['Wrists lifting off ground'], primaryMuscles: ['Wrist Flexors', 'Forearms'], animationType: 'hollow_body', isIsometric: true, defaultRest: 90, pillar: 'Vertical Push', secondaryPillars: ['Core'] },
      { level: 2, name: 'Hollow Body Holds & Arch Body Rocks', target: '3 x 45s', cues: ['Press lower back flat into floor', 'Squeeze glutes'], pitfalls: ['Arching lower back'], primaryMuscles: ['Core', 'Abs'], animationType: 'hollow_body', isIsometric: true, defaultRest: 90, pillar: 'Core', secondaryPillars: [] },
      { level: 3, name: 'Crow Pose / Frog Stand', target: '3 x 20s Hold', cues: ['Grip ground wide', 'Lean shoulders past wrists'], pitfalls: ['Looking backward'], primaryMuscles: ['Triceps', 'Wrists'], animationType: 'crow_pose', isIsometric: true, defaultRest: 90, pillar: 'Vertical Push', secondaryPillars: ['Core'] },
      { level: 4, name: 'Chest-to-Wall Handstand Hold', target: '3 x 30s Hold', cues: ['Shrug shoulders into ears', 'Tuck chin slightly'], pitfalls: ['Banana arch'], primaryMuscles: ['Shoulders', 'Upper Back'], animationType: 'hs_wall', isIsometric: true, defaultRest: 90, pillar: 'Vertical Push', secondaryPillars: ['Core'] },
      { level: 5, name: 'Freestanding Kick-Up Practice', target: '10 Attempts', cues: ['Lunge kick-up entry', 'Locked arms'], pitfalls: ['Bending elbows'], primaryMuscles: ['Full Body', 'Shoulders'], animationType: 'hs_freestanding', defaultRest: 90, pillar: 'Vertical Push', secondaryPillars: ['Core', 'Leg Power'] }
    ],
    levels6to10: [
      { level: 6, name: 'Pike Push-Ups on Floor', target: '3 x 12 Reps', cues: ['Stack hips over shoulders', 'Lower head forward of hands'], pitfalls: ['Flaring elbows wide'], primaryMuscles: ['Anterior Deltoids', 'Triceps'], defaultRest: 90, pillar: 'Vertical Push', secondaryPillars: ['Core'] },
      { level: 7, name: 'Elevated Feet Pike Push-Ups', target: '3 x 10 Reps', cues: ['Keep torso vertical', 'Controlled descent'], pitfalls: ['Sagging hips'], primaryMuscles: ['Shoulders', 'Upper Chest'], defaultRest: 90, pillar: 'Vertical Push', secondaryPillars: ['Core'] },
      { level: 8, name: 'Wall-Supported Eccentric HSPU', target: '3 x 5 Reps (4s descent)', cues: ['4 second slow negative', 'Touch head to floor softly'], pitfalls: ['Dropping fast at bottom'], primaryMuscles: ['Shoulders', 'Triceps'], defaultRest: 90, pillar: 'Vertical Push', secondaryPillars: ['Core'] },
      { level: 9, name: 'Strict Wall Handstand Push-Ups', target: '3 x 6 Reps', cues: ['Press straight up without kicking wall'], pitfalls: ['Using leg momentum'], primaryMuscles: ['Shoulder Girdle', 'Triceps'], defaultRest: 90, pillar: 'Vertical Push', secondaryPillars: ['Core'] },
      { level: 10, name: 'Freestanding Handstand Push-Ups', target: '3 x 3 Reps', cues: ['Maintain tight core balance throughout press'], pitfalls: ['Losing balance at lockout'], primaryMuscles: ['Elite Shoulder & Core Chain'], defaultRest: 90, pillar: 'Vertical Push', secondaryPillars: ['Core'] }
    ]
  },
  {
    id: 'dragon-flag',
    title: 'Dragon Flag Progression',
    category: 'Elite',
    description: 'Build ultimate anterior core strength and straight-body leverage.',
    badge: 'Elite Core',
    levels1to5Title: 'Core & Lever Foundations',
    levels6to10Title: 'Phase 2: Full Leverage Mastery',
    levels1to5: [
      { level: 1, name: 'Reverse Crunches & Leg Lowers', target: '3 x 12 Reps', cues: ['Control lower back on mat'], pitfalls: ['Dropping legs too fast'], primaryMuscles: ['Lower Abs'], animationType: 'seated_pike_compression', defaultRest: 90, pillar: 'Core', secondaryPillars: ['Leg Power'] },
      { level: 2, name: 'Hanging Leg Raises', target: '3 x 10 Reps', cues: ['Dead hang start', 'Raise toes to bar'], pitfalls: ['Kipping momentum'], primaryMuscles: ['Abs', 'Hip Flexors'], defaultRest: 90, pillar: 'Core', secondaryPillars: ['Vertical Pull'] },
      { level: 3, name: 'Tuck Dragon Flag Raises', target: '3 x 8 Reps', cues: ['Keep knees tucked to chest'], pitfalls: ['Bending arms'], primaryMuscles: ['Rectus Abdominis'], defaultRest: 90, pillar: 'Core', secondaryPillars: ['Vertical Pull'] },
      { level: 4, name: 'Full Dragon Flag Negatives (Lowers)', target: '3 x 5 Reps (5s descent)', cues: ['Rigid straight body line', '5 second lower'], pitfalls: ['Hips breaking at waist'], primaryMuscles: ['Full Core', 'Lats'], defaultRest: 90, pillar: 'Core', secondaryPillars: ['Vertical Pull', 'Leg Power'] },
      { level: 5, name: 'Full Straight-Body Dragon Flag', target: '3 x 5 Reps', cues: ['Pivoting only on upper back/shoulders'], pitfalls: ['Arching back'], primaryMuscles: ['Elite Core & Posterior Chain'], defaultRest: 90, pillar: 'Core', secondaryPillars: ['Vertical Pull', 'Leg Power'] }
    ],
    levels6to10: [
      { level: 6, name: 'Weighted Dragon Flag Negatives', target: '3 x 3 Reps', cues: ['Hold ankle weight or plate'], pitfalls: ['Losing spinal rigidity'], primaryMuscles: ['Advanced Core'], defaultRest: 90, pillar: 'Core', secondaryPillars: ['Vertical Pull', 'Leg Power'] },
      { level: 7, name: 'Straddle Dragon Flag Hold', target: '3 x 15s Hold', cues: ['Open legs wide to reduce leverage'], pitfalls: ['Knees bending'], primaryMuscles: ['Obliques & Abdominals'], isIsometric: true, defaultRest: 90, pillar: 'Core', secondaryPillars: ['Leg Power'] },
      { level: 8, name: 'Single-Leg Dragon Flag Lowers', target: '3 x 4 Reps / Leg', cues: ['Extend one leg, tuck other'], pitfalls: ['Asymmetric torso rotation'], primaryMuscles: ['Unilateral Core Chain'], defaultRest: 90, pillar: 'Core', secondaryPillars: ['Leg Power'] },
      { level: 9, name: 'Dragon Flag Flutter Kicks', target: '3 x 30s', cues: ['Maintain rigid horizontal hover'], pitfalls: ['Bouncing hips'], primaryMuscles: ['Deep Transverse Abdominis'], isIsometric: true, defaultRest: 90, pillar: 'Core', secondaryPillars: ['Leg Power'] },
      { level: 10, name: 'Elite Straddle-to-Full Press Dragon Flag', target: '3 x 3 Reps', cues: ['Zero momentum ascent & descent'], pitfalls: ['Crashing down on neck'], primaryMuscles: ['Supreme Calisthenics Core'], defaultRest: 90, pillar: 'Core', secondaryPillars: ['Vertical Pull', 'Leg Power'] }
    ]
  },
  {
    id: 'one_arm_pushup',
    title: 'One-Arm Push-Up Pathway',
    category: 'Advanced',
    description: 'Master unilateral horizontal pressing, intense rotational core anti-extension, and single-arm lockout.',
    badge: 'Unilateral Press',
    levels1to5: [
      { level: 1, name: 'Incline One-Arm Push-Ups', target: '3 x 10 Clean Reps / Arm', primaryMuscles: ['Chest', 'Anterior Deltoid', 'Core Obliques'], cues: ['Place working hand on elevated bench or bar', 'Feet set wide (tripod base)'], pitfalls: ['Twisting hips open', 'Flaring elbow'], animationType: 'one_arm_pushup', defaultRest: 90, pillar: 'Horizontal Push', secondaryPillars: ['Core'] },
      { level: 2, name: 'Archer Push-Ups (Floor)', target: '3 x 8 Reps / Arm', primaryMuscles: ['Chest', 'Triceps', 'Serratus'], cues: ['Lower toward working arm', 'Assist arm straight'], pitfalls: ['Bending assist arm', 'Dropping hips'], animationType: 'pushup_archer', defaultRest: 90, pillar: 'Horizontal Push', secondaryPillars: ['Core'] },
      { level: 3, name: 'Assisted One-Arm Push-Ups', target: '3 x 6 Reps / Arm', primaryMuscles: ['Chest', 'Triceps', 'Core'], cues: ['Assist hand on ball 12 inches to side', 'Working arm bears 85% load'], pitfalls: ['Pushing with assist hand'], animationType: 'one_arm_pushup', defaultRest: 90, pillar: 'Horizontal Push', secondaryPillars: ['Core'] },
      { level: 4, name: 'One-Arm Push-Up Negatives', target: '3 x 4 Reps / Arm', primaryMuscles: ['Chest', 'Anterior Deltoid'], cues: ['Control descent for 4 slow seconds'], pitfalls: ['Plummeting at bottom', 'Hips sagging'], animationType: 'one_arm_pushup', defaultRest: 90, pillar: 'Horizontal Push', secondaryPillars: ['Core'] },
      { level: 5, name: 'Full Freestanding One-Arm Push-Up', target: '3 x 3 Clean Reps / Arm', primaryMuscles: ['Unilateral Pectoral Chain', 'Deep Core'], cues: ['Single hand under chest', 'Drive through working palm'], pitfalls: ['Extreme hip twisting', 'Incomplete lockout'], animationType: 'one_arm_pushup', defaultRest: 90, pillar: 'Horizontal Push', secondaryPillars: ['Core'] }
    ]
  },
  {
    id: 'pulling',
    title: 'Strict Pull-Up Masterclass',
    category: 'Intermediate',
    description: 'Build vertical pulling strength from foundational hangs to advanced L-sit & weighted reps.',
    badge: 'Pulling Power',
    levels1to5: [
      { level: 1, name: 'Dead Hang & Scapular Pulls', target: '3 x 45s Hang / 3 x 12 Scap Pulls', primaryMuscles: ['Lower Traps', 'Lats'], cues: ['Active shoulders down and back', 'Full grip'], pitfalls: ['Shrugging shoulders', 'Bending elbows'], animationType: 'scapular_pull', isIsometric: true, defaultRest: 90, pillar: 'Vertical Pull', secondaryPillars: [] },
      { level: 2, name: 'Australian / Inverted Rows', target: '3 x 12 Reps', primaryMuscles: ['Rhomboids', 'Mid Traps', 'Biceps'], cues: ['Rigid straight plank', 'Pull chest to bar'], pitfalls: ['Sagging hips', 'Half reps'], animationType: 'inverted_row', defaultRest: 90, pillar: 'Horizontal Pull', secondaryPillars: ['Vertical Pull', 'Core'] },
      { level: 3, name: 'Eccentric Pull-Up Negatives', target: '3 x 5 Reps (5s descent)', primaryMuscles: ['Lats', 'Brachialis'], cues: ['Chin over bar', 'Control descent evenly'], pitfalls: ['Dropping quickly', 'No dead hang'], animationType: 'pullup_negative', defaultRest: 90, pillar: 'Vertical Pull', secondaryPillars: [] },
      { level: 4, name: 'Strict Dead-Stop Pull-Ups', target: '3 x 8 Clean Reps', primaryMuscles: ['Lats', 'Biceps', 'Rear Delts'], cues: ['Dead stop at bottom', 'Drive elbows toward hips'], pitfalls: ['Kipping or swinging legs'], animationType: 'strict_pullup', defaultRest: 90, pillar: 'Vertical Pull', secondaryPillars: [] },
      { level: 5, name: 'L-Sit / Chest-To-Bar Pull-Ups', target: '3 x 5 Reps', primaryMuscles: ['Upper Lats', 'Abs', 'Upper Back'], cues: ['Maintain 90-degree leg extension', 'Collarbone to bar'], pitfalls: ['Dropping legs below horizontal'], animationType: 'lsit_pullup', defaultRest: 90, pillar: 'Vertical Pull', secondaryPillars: ['Core', 'Leg Power'] }
    ]
  },
  {
    id: 'pushing',
    title: 'Push-Up & Pushing Variations',
    category: 'Beginner',
    description: 'Master horizontal pressing mechanics, core tension, and scapular protraction.',
    badge: 'Push Strength',
    levels1to5: [
      { level: 1, name: 'Incline / Hollow Plank Push-Ups', target: '3 x 15 Reps', primaryMuscles: ['Pectorals', 'Anterior Delts'], cues: ['Posterior Pelvic Tilt', 'Protract scaps at top'], pitfalls: ['Flaring elbows', 'Sagging lower back'], animationType: 'pushup_standard', defaultRest: 90, pillar: 'Horizontal Push', secondaryPillars: ['Core'] },
      { level: 2, name: 'Strict Standard Push-Ups', target: '3 x 20 Crisp Reps', primaryMuscles: ['Chest', 'Triceps', 'Core'], cues: ['Chest 1 inch off floor', 'Lock elbows at top'], pitfalls: ['Worming off floor', 'Incomplete lockout'], animationType: 'pushup_standard', defaultRest: 90, pillar: 'Horizontal Push', secondaryPillars: ['Core'] },
      { level: 3, name: 'Diamond & Close-Grip Push-Ups', target: '3 x 12 Reps', primaryMuscles: ['Triceps Brachii', 'Inner Chest'], cues: ['Index fingers and thumbs touching', 'Elbows tucked'], pitfalls: ['Elbow flared outward'], animationType: 'pushup_diamond', defaultRest: 90, pillar: 'Horizontal Push', secondaryPillars: ['Core'] },
      { level: 4, name: 'Pseudo Planche Push-Ups (PPPU)', target: '3 x 8 Reps', primaryMuscles: ['Anterior Delts', 'Upper Chest'], cues: ['Hands turned outward', 'Lean shoulders forward past wrists'], pitfalls: ['Losing lean during descent'], animationType: 'pushup_pppu', defaultRest: 90, pillar: 'Horizontal Push', secondaryPillars: ['Core'] },
      { level: 5, name: 'Archer & Decline Elevated Push-Ups', target: '3 x 8 Reps / Side', primaryMuscles: ['Chest (Unilateral)', 'Triceps'], cues: ['Extend non-working arm straight sideways'], pitfalls: ['Twisting hips off square'], animationType: 'pushup_archer', defaultRest: 90, pillar: 'Horizontal Push', secondaryPillars: ['Core'] }
    ]
  },
  {
    id: 'dragon_squat',
    title: 'Dragon Squat Masterclass',
    category: 'Advanced',
    description: 'Master the ultimate single-leg squat: thread non-working leg behind & out sideways.',
    badge: 'Elite Leg Skill',
    levels1to5: [
      { level: 1, name: 'Deep Curtsy Squats', target: '3 x 12 Reps / Leg', primaryMuscles: ['Glute Medius', 'Quads'], cues: ['Step rear foot diagonally back', 'Keep front heel glued to floor'], pitfalls: ['Collapsing front knee inward'], animationType: 'dragon_squat', defaultRest: 90, pillar: 'Leg Power', secondaryPillars: ['Core'] },
      { level: 2, name: 'Elevated Shrimp Squats', target: '3 x 8 Reps / Leg', primaryMuscles: ['Quads', 'Glutes'], cues: ['Hold rear ankle behind back', 'Descend until rear knee touches floor'], pitfalls: ['Plummeting onto hard floor'], animationType: 'dragon_squat', defaultRest: 90, pillar: 'Leg Power', secondaryPillars: ['Core'] },
      { level: 3, name: 'Assisted Dragon Squat', target: '3 x 6 Reps / Leg', primaryMuscles: ['Hip Rotators', 'Ankles'], cues: ['Hold pole for light balance', 'Sweep leg out laterally'], pitfalls: ['Pulling heavily with arms'], animationType: 'dragon_squat', defaultRest: 90, pillar: 'Leg Power', secondaryPillars: ['Core'] },
      { level: 4, name: 'Box / Bench Dragon Squat Negatives', target: '3 x 5 Reps / Leg', primaryMuscles: ['Quads', 'Glute Max'], cues: ['Stand on low box', 'Control descent for 4 seconds'], pitfalls: ['Dropping too fast at bottom'], animationType: 'dragon_squat', defaultRest: 90, pillar: 'Leg Power', secondaryPillars: ['Core'] },
      { level: 5, name: 'Full Freestanding Dragon Squat', target: '3 x 3 Clean Reps / Leg', primaryMuscles: ['Full Lower Body Chain', 'Core'], cues: ['Unassisted deep single-leg squat', 'Torso dips parallel to floor'], pitfalls: ['Working heel popping up'], animationType: 'dragon_squat', defaultRest: 90, pillar: 'Leg Power', secondaryPillars: ['Core'] }
    ]
  },
  {
    id: 'pistol_squat',
    title: 'Single-Leg Pistol Squat Track',
    category: 'Intermediate',
    description: 'Master knee resilience, single-leg power, and ankle mobility from air squats to full pistols.',
    badge: 'Leg Mastery',
    levels1to5: [
      { level: 1, name: 'Deep Bodyweight Air Squats', target: '3 x 20 Reps', primaryMuscles: ['Quads', 'Glutes', 'Calves'], cues: ['Knees tracking over toes', 'Hips below knee crease'], pitfalls: ['Heels lifting', 'Knees caving'], animationType: 'pistol_squat', defaultRest: 90, pillar: 'Leg Power', secondaryPillars: [] },
      { level: 2, name: 'Assisted Single-Leg Step-Downs', target: '3 x 10 Reps / Leg', primaryMuscles: ['VMO', 'Glute Medius'], cues: ['Lower trailing leg slowly', 'Touch heel softly to floor'], pitfalls: ['Plummeting down quickly'], animationType: 'pistol_squat', defaultRest: 90, pillar: 'Leg Power', secondaryPillars: ['Core'] },
      { level: 3, name: 'Bench / Chair Pistol Squats', target: '3 x 8 Reps / Leg', primaryMuscles: ['Quads', 'Hip Flexors'], cues: ['Extend non-working leg out front', 'Lower hips gently to seat'], pitfalls: ['Bouncing off bench'], animationType: 'pistol_squat', defaultRest: 90, pillar: 'Leg Power', secondaryPillars: ['Core'] },
      { level: 4, name: 'Counter-Weighted Pistol Squats', target: '3 x 6 Reps / Leg', primaryMuscles: ['Quads', 'Ankle Mobility'], cues: ['Hold weight in front as counter-balance', 'Sit deep into full flexion'], pitfalls: ['Rounding lower back excessively'], animationType: 'pistol_squat', defaultRest: 90, pillar: 'Leg Power', secondaryPillars: ['Core'] },
      { level: 5, name: 'Full Freestanding Pistol Squat', target: '3 x 5 Reps / Leg', primaryMuscles: ['Quads', 'Full Leg Chain'], cues: ['Unassisted deep squat', 'Drive up through mid-foot and heel'], pitfalls: ['Heel coming off ground', 'Losing balance'], animationType: 'pistol_squat', defaultRest: 90, pillar: 'Leg Power', secondaryPillars: ['Core'] }
    ]
  },
  {
    id: 'muscle_up',
    title: 'Bar Muscle-Up Pathway',
    category: 'Advanced',
    description: 'Transition from pulling strength to explosive upper body turnover over the bar.',
    badge: 'Explosive Power',
    levels1to5: [
      { level: 1, name: 'High Chest-To-Bar Pull-Ups', target: '3 x 8 Explosive Reps', primaryMuscles: ['Lats', 'Upper Back'], cues: ['Pull past chin to touch chest to bar'], pitfalls: ['Pulling only to chin level'], animationType: 'strict_pullup', defaultRest: 90, pillar: 'Vertical Pull', secondaryPillars: [] },
      { level: 2, name: 'Straight Bar Dips', target: '3 x 10 Full Lockout Reps', primaryMuscles: ['Triceps', 'Lower Chest'], cues: ['Lean shoulders forward over bar', 'Touch stomach to bar'], pitfalls: ['Incomplete lockout at top'], animationType: 'pushup_standard', defaultRest: 90, pillar: 'Vertical Push', secondaryPillars: ['Vertical Pull'] },
      { level: 3, name: 'Kipping Cast & Knee Drive Drills', target: '3 x 5 Transitions', primaryMuscles: ['Core', 'Hip Flexors'], cues: ['Cast outward into arch', 'Drive knees up & pull bar down'], pitfalls: ['Pulling straight up'], animationType: 'muscle_up', defaultRest: 90, pillar: 'Vertical Pull', secondaryPillars: ['Core'] },
      { level: 4, name: 'Band-Assisted Bar Muscle-Up', target: '3 x 5 Reps', primaryMuscles: ['Full Upper Body Chain'], cues: ['Loop resistance band around foot', 'Lean chest forward instantly'], pitfalls: ['Chicken-winging over bar'], animationType: 'muscle_up', defaultRest: 90, pillar: 'Vertical Pull', secondaryPillars: ['Vertical Push'] },
      { level: 5, name: 'Strict / Clean Bar Muscle-Up', target: '3 x 3 Strict Reps', primaryMuscles: ['Lats', 'Chest', 'Triceps'], cues: ['Explosive pull to chest', 'Rapid forward wrist flip'], pitfalls: ['Uneven arm transition', 'Kicking legs wildly'], animationType: 'muscle_up', defaultRest: 90, pillar: 'Vertical Pull', secondaryPillars: ['Vertical Push'] }
    ]
  },
  {
    id: 'lsit_core',
    title: 'L-Sit & Compression Core',
    category: 'Intermediate',
    description: 'Master hip flexor compression, active rectus abdominis strength, and straight-arm support.',
    badge: 'Core Tension',
    levels1to5: [
      { level: 1, name: 'Seated Pike Compression Lifts', target: '3 x 15 Reps', primaryMuscles: ['Hip Flexors', 'Lower Abs'], cues: ['Place hands by knees', 'Lift heels off floor'], pitfalls: ['Leaning backward'], animationType: 'seated_pike_compression', defaultRest: 90, pillar: 'Core', secondaryPillars: ['Leg Power'] },
      { level: 2, name: 'Tuck L-Sit Hold', target: '3 x 20s Hold', primaryMuscles: ['Abs', 'Triceps', 'Serratus'], cues: ['Push hands into floor to depress shoulders', 'Pull knees to chest'], pitfalls: ['Shoulders shrugging into ears'], animationType: 'lsit_support', isIsometric: true, defaultRest: 90, pillar: 'Core', secondaryPillars: ['Vertical Push', 'Leg Power'] },
      { level: 3, name: 'Single-Leg Extended L-Sit', target: '3 x 15s Hold / Leg', primaryMuscles: ['Hip Flexors', 'Quads'], cues: ['Extend one leg straight', 'Lock elbows'], pitfalls: ['Extended leg dipping'], animationType: 'lsit_support', isIsometric: true, defaultRest: 90, pillar: 'Core', secondaryPillars: ['Vertical Push', 'Leg Power'] },
      { level: 4, name: 'Full Freestanding L-Sit Hold', target: '3 x 15s Hold', primaryMuscles: ['Rectus Abdominis', 'Quads'], cues: ['Both legs extended parallel to ground', 'Push ground away'], pitfalls: ['Legs sagging toward floor'], animationType: 'lsit_support', isIsometric: true, defaultRest: 90, pillar: 'Core', secondaryPillars: ['Vertical Push', 'Leg Power'] },
      { level: 5, name: 'V-Sit / High Compression L-Sit', target: '3 x 10s Hold', primaryMuscles: ['Upper/Lower Abs', 'Hip Flexors'], cues: ['Drive feet upward past 90 degrees', 'Intense core compression'], pitfalls: ['Bending knees'], animationType: 'vsit_compression', isIsometric: true, defaultRest: 90, pillar: 'Core', secondaryPillars: ['Vertical Push', 'Leg Power'] }
    ]
  }
];
