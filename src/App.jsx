import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  signInAnonymously 
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  onSnapshot, 
  addDoc, 
  deleteDoc 
} from 'firebase/firestore';
import { 
  Dumbbell, 
  Trophy, 
  Timer as TimerIcon, 
  CheckCircle2, 
  ChevronRight, 
  Play, 
  Pause, 
  RotateCcw, 
  Plus, 
  Trash2, 
  Flame, 
  Target, 
  ShieldAlert, 
  Award, 
  Zap, 
  BarChart3, 
  Activity, 
  Check, 
  Cloud, 
  Eye, 
  X, 
  Sparkles, 
  MessageSquare, 
  Layers, 
  CheckSquare, 
  ChevronUp, 
  ChevronDown, 
  Edit3,
  LogIn,
  LogOut,
  User as UserIcon,
  Mail,
  Lock,
  AlertCircle
} from 'lucide-react';

// --- YOUR LIVE FIREBASE CONFIGURATION ---
const firebaseConfig = {
  apiKey: "AIzaSyANdR3YT6_4QN8U6pDfi6NSKUEqQ23dyho",
  authDomain: "apex-calisthenics-2996c.firebaseapp.com",
  projectId: "apex-calisthenics-2996c",
  storageBucket: "apex-calisthenics-2996c.firebasestorage.app",
  messagingSenderId: "688212368969",
  appId: "1:688212368969:web:165a0e7082d6a2a487e998",
  measurementId: "G-5FHHDQ0JGR"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- DATA STRUCTURES: PROGRESSION TRACKS ---
const PROGRESSION_TRACKS = [
  {
    id: 'one_arm_pushup',
    title: 'One-Arm Push-Up Pathway',
    description: 'Master unilateral horizontal pressing, intense rotational core anti-extension, and single-arm lockout.',
    color: 'amber',
    badge: 'Unilateral Press',
    levels: [
      {
        level: 1,
        id: 'oapu_1',
        name: 'Incline One-Arm Push-Ups',
        target: '3 x 10 Clean Reps / Arm',
        primaryMuscles: ['Chest', 'Anterior Deltoid', 'Core Obliques'],
        cues: [
          'Place working hand on elevated bench or bar at shoulder height',
          'Feet set wide (double shoulder-width) to form a stable tripod base',
          'Keep hips and shoulders square to the surface (resist twisting)'
        ],
        pitfalls: ['Twisting hips open toward non-working side', 'Flaring working elbow 90 degrees'],
        type: 'reps',
        animationType: 'one_arm_pushup'
      },
      {
        level: 2,
        id: 'oapu_2',
        name: 'Archer Push-Ups (Floor)',
        target: '3 x 8 Reps / Arm',
        primaryMuscles: ['Chest (Unilateral Focus)', 'Triceps', 'Serratus Anterior'],
        cues: [
          'Start with wide hand stance on floor',
          'Lower body towards working arm while straightening the assist arm sideways',
          'Assist arm only balances on fingertips'
        ],
        pitfalls: ['Bending assist arm heavily', 'Dropping hips below parallel'],
        type: 'reps',
        animationType: 'pushup_archer'
      },
      {
        level: 3,
        id: 'oapu_3',
        name: 'Assisted One-Arm Push-Ups (Offset Hand/Ball)',
        target: '3 x 6 Reps / Arm',
        primaryMuscles: ['Chest', 'Triceps', 'Core Stabilizers'],
        cues: [
          'Place non-working hand on an elevated ball or block 12 inches to the side',
          'Working arm bears 85% of bodyweight through full range',
          'Tuck working elbow 45 degrees toward the ribcage'
        ],
        pitfalls: ['Pushing primarily with elevated assist hand'],
        type: 'reps',
        animationType: 'one_arm_pushup'
      },
      {
        level: 4,
        id: 'oapu_4',
        name: 'One-Arm Push-Up Negatives',
        target: '3 x 4 Reps / Arm (4-second descent)',
        primaryMuscles: ['Chest', 'Anterior Deltoid', 'Anti-Rotation Obliques'],
        cues: [
          'Wide foot stance, single hand centered under sternum/collarbone',
          'Control descent for 4 slow seconds until chest taps floor',
          'Reset with both hands to push back up'
        ],
        pitfalls: ['Plummeting through bottom 2 inches', 'Hips sagging into lumbar extension'],
        type: 'reps',
        animationType: 'one_arm_pushup'
      },
      {
        level: 5,
        id: 'oapu_5',
        name: 'Full Freestanding One-Arm Push-Up',
        target: '3 x 3 Clean Lockout Reps / Arm',
        primaryMuscles: ['Unilateral Pectoral Chain', 'Triceps Brachii', 'Deep Core'],
        cues: [
          'Single working hand directly under chest, non-working arm tucked behind lower back',
          'Lower chest 1 inch off floor without rotating hips',
          'Drive through working palm to complete lockout'
        ],
        pitfalls: ['Extreme hip twisting / corkscrewing', 'Incomplete range of motion'],
        type: 'reps',
        animationType: 'one_arm_pushup'
      }
    ]
  },
  {
    id: 'dragon_squat',
    title: 'Dragon Squat Masterclass',
    description: 'Master the ultimate single-leg squat: thread non-working leg behind & out sideways while keeping body parallel.',
    color: 'rose',
    badge: 'Elite Leg Skill',
    levels: [
      {
        level: 1,
        id: 'dragon_1',
        name: 'Deep Curtsy Squats',
        target: '3 x 12 Reps / Leg',
        primaryMuscles: ['Glute Medius', 'Quads', 'Ankle Mobility'],
        cues: [
          'Step rear foot diagonally back and across behind front leg',
          'Keep front heel glued to floor and torso facing forward',
          'Lower rear knee toward outer heel of front foot'
        ],
        pitfalls: ['Collapsing front knee inward', 'Lifting front heel'],
        type: 'reps',
        animationType: 'dragon_squat'
      },
      {
        level: 2,
        id: 'dragon_2',
        name: 'Elevated Shrimp Squats',
        target: '3 x 8 Reps / Leg',
        primaryMuscles: ['Quads', 'Glutes', 'Patellar Stability'],
        cues: [
          'Hold rear ankle behind back with same-side hand',
          'Descend on working leg until rear knee touches floor gently',
          'Keep working heel pressed firmly down'
        ],
        pitfalls: ['Plummeting rear knee onto hard floor', 'Rounding back'],
        type: 'reps',
        animationType: 'dragon_squat'
      },
      {
        level: 3,
        id: 'dragon_3',
        name: 'Assisted Dragon Squat (Pole / Rings)',
        target: '3 x 6 Reps / Leg',
        primaryMuscles: ['Hip External Rotators', 'Glutes', 'Ankles'],
        cues: [
          'Hold pole or resistance band for light balance support',
          'Reach non-working leg behind and sweep it out laterally to side',
          'Hinge torso forward parallel to floor as counter-balance'
        ],
        pitfalls: ['Pulling heavily with arms instead of driving through leg'],
        type: 'reps',
        animationType: 'dragon_squat'
      },
      {
        level: 4,
        id: 'dragon_4',
        name: 'Box / Bench Dragon Squat Negatives',
        target: '3 x 5 Reps / Leg (4-second descent)',
        primaryMuscles: ['Quads', 'Glute Max/Medius', 'Ankle Flexion'],
        cues: [
          'Stand on low box to allow extended rear leg room to clear floor',
          'Control descent for 4 seconds, sweeping rear leg out sideways',
          'Touch seat softly before standing back up'
        ],
        pitfalls: ['Dropping too fast in bottom 2 inches'],
        type: 'reps',
        animationType: 'dragon_squat'
      },
      {
        level: 5,
        id: 'dragon_5',
        name: 'Full Freestanding Dragon Squat',
        target: '3 x 3 Clean Reps / Leg',
        primaryMuscles: ['Full Lower Body Chain', 'Hip Rotators', 'Core Obliques'],
        cues: [
          'Unassisted deep single-leg squat',
          'Thread rear leg behind working leg and extend it straight out sideways',
          'Torso dips parallel to floor, perpendicular to side-extended leg'
        ],
        pitfalls: ['Working heel popping up', 'Trailing leg touching floor'],
        type: 'reps',
        animationType: 'dragon_squat'
      }
    ]
  },
  {
    id: 'pulling',
    title: 'Strict Pull-Up Masterclass',
    description: 'Build vertical pulling strength from foundational hangs to advanced L-sit & weighted reps.',
    color: 'emerald',
    badge: 'Pulling Power',
    levels: [
      {
        level: 1,
        id: 'pull_1',
        name: 'Dead Hang & Scapular Pulls',
        target: '3 x 45s Hang / 3 x 12 Scap Pulls',
        primaryMuscles: ['Lower Traps', 'Lats', 'Grip/Forearms'],
        cues: [
          'Active shoulders: Pull shoulder blades down and back without bending elbows',
          'Full grip (knuckles over bar), core braced',
          'Keep legs straight and squeezed together in hollow body position'
        ],
        pitfalls: ['Shrugging shoulders into neck', 'Bending elbows during scapular pulls', 'Arching lower back'],
        type: 'reps_and_hold',
        animationType: 'scapular_pull'
      },
      {
        level: 2,
        id: 'pull_2',
        name: 'Australian / Inverted Rows',
        target: '3 x 12 Reps (Bar at chest height)',
        primaryMuscles: ['Rhomboids', 'Mid Traps', 'Biceps', 'Core'],
        cues: [
          'Keep body in a rigid straight plank from head to heels',
          'Pull chest directly to bar/rings with controlled tempo',
          'Squeeze shoulder blades together at top lock-out for 1 second'
        ],
        pitfalls: ['Sagging hips (lack of glute engagement)', 'Leading with chin/neck', 'Half reps'],
        type: 'reps',
        animationType: 'inverted_row'
      },
      {
        level: 3,
        id: 'pull_3',
        name: 'Eccentric Pull-Up Negatives',
        target: '3 x 5 Reps (5-second descent)',
        primaryMuscles: ['Lats', 'Brachialis', 'Core'],
        cues: [
          'Jump/step to top position with chin clearly over the bar',
          'Control descent at an even tempo through the entire range',
          'Achieve a full dead-hang lock at the bottom before resetting'
        ],
        pitfalls: ['Dropping quickly through the mid-range', 'Not reaching full arm extension at bottom'],
        type: 'reps',
        animationType: 'pullup_negative'
      },
      {
        level: 4,
        id: 'pull_4',
        name: 'Strict Dead-Stop Pull-Ups',
        target: '3 x 8 Clean Reps',
        primaryMuscles: ['Lats', 'Biceps', 'Rear Delts', 'Abs'],
        cues: [
          'Dead stop at bottom, initiate movement using scapular depression',
          'Pull chest up to bar (drive elbows toward hips)',
          'No leg swinging, kicking, or kipping momentum'
        ],
        pitfalls: ['Kipping or swinging legs', 'Passing chin over bar by reaching neck out'],
        type: 'reps',
        animationType: 'strict_pullup'
      },
      {
        level: 5,
        id: 'pull_5',
        name: 'L-Sit / Chest-To-Bar Pull-Ups',
        target: '3 x 5 Reps',
        primaryMuscles: ['Upper Lats', 'Abs & Hip Flexors', 'Upper Back'],
        cues: [
          'Maintain 90-degree leg extension throughout pull',
          'Touch upper chest/collarbone cleanly to the bar',
          'Controlled 2-second negative back to dead hang'
        ],
        pitfalls: ['Dropping legs below horizontal', 'Bouncing off bottom position'],
        type: 'reps',
        animationType: 'lsit_pullup'
      }
    ]
  },
  {
    id: 'pushing',
    title: 'Push-Up & Pushing Variations',
    description: 'Master horizontal pressing mechanics, core tension, and scapular protraction.',
    color: 'blue',
    badge: 'Push Strength',
    levels: [
      {
        level: 1,
        id: 'push_1',
        name: 'Incline / Hollow Plank Push-Ups',
        target: '3 x 15 Reps',
        primaryMuscles: ['Pectorals', 'Anterior Delts', 'Serratus'],
        cues: [
          'Posterior Pelvic Tilt (PPT): Tuck tailbone, squeeze glutes hard',
          'Protract scaps at top (push floor away to round upper back slightly)',
          'Elbows tucked back at ~45-degree angle to body'
        ],
        pitfalls: ['Flaring elbows 90 degrees', 'Pike or sagging lower back'],
        type: 'reps',
        animationType: 'pushup_standard'
      },
      {
        level: 2,
        id: 'push_2',
        name: 'Strict Standard Push-Ups',
        target: '3 x 20 Crisp Reps',
        primaryMuscles: ['Chest', 'Triceps', 'Core / Abs'],
        cues: [
          'Full depth: Chest touches 1 inch off floor without resting',
          'Lock elbows at top into full scapular protraction',
          'Rigid hollow body alignment throughout'
        ],
        pitfalls: ['Snake/worming off floor', 'Incomplete lockout at top'],
        type: 'reps',
        animationType: 'pushup_standard'
      },
      {
        level: 3,
        id: 'push_3',
        name: 'Diamond & Close-Grip Push-Ups',
        target: '3 x 12 Reps',
        primaryMuscles: ['Triceps Brachii', 'Inner Chest', 'Anterior Deltoid'],
        cues: [
          'Hands close under chest, index fingers and thumbs touching',
          'Keep elbows tucked close to ribcage',
          'Focus tension on triceps and inner chest lockout'
        ],
        pitfalls: ['Elbow flared outward', 'Hips dropping'],
        type: 'reps',
        animationType: 'pushup_diamond'
      },
      {
        level: 4,
        id: 'push_4',
        name: 'Pseudo Planche Push-Ups (PPPU)',
        target: '3 x 8 Reps (Slight Forward Lean)',
        primaryMuscles: ['Anterior Delts', 'Upper Chest', 'Serratus Anterior'],
        cues: [
          'Hands turned outward 45-90 degrees',
          'Lean shoulders forward past wrists before descending',
          'Maintain strong hollow body and scapular protraction throughout'
        ],
        pitfalls: ['Losing lean during descent', 'Arching lower back'],
        type: 'reps',
        animationType: 'pushup_pppu'
      },
      {
        level: 5,
        id: 'push_5',
        name: 'Archer & Decline Elevated Push-Ups',
        target: '3 x 8 Reps (Per side for archer)',
        primaryMuscles: ['Chest (Unilateral)', 'Triceps', 'Obliques'],
        cues: [
          'Extend non-working arm straight sideways',
          'Lower body towards working hand while keeping core tight',
          'Smooth transition across reps without twisting hips'
        ],
        pitfalls: ['Twisting hips off square', 'Shortening range of motion'],
        type: 'reps',
        animationType: 'pushup_archer'
      }
    ]
  },
  {
    id: 'handstand',
    title: 'Handstand & Alignment Skill',
    description: 'Develop shoulder overhead mobility, wall alignment, and finger re-balancing mechanics.',
    color: 'amber',
    badge: 'Inversion Balance',
    levels: [
      {
        level: 1,
        id: 'hs_1',
        name: 'Wrist Conditioning & Hollow Body Hold',
        target: '3 x 60s Hollow Hold / Wrist Warmup',
        primaryMuscles: ['Rectus Abdominis', 'Wrist Flexors/Extensors'],
        cues: [
          'Press lower back flat into floor (no gap under lumbar spine)',
          'Reach arms overhead, legs extended 6 inches off ground',
          'Active wrist extensions and finger flexions on floor'
        ],
        pitfalls: ['Lower back arching off floor', 'Bending knees/elbows'],
        type: 'hold',
        animationType: 'hollow_body'
      },
      {
        level: 2,
        id: 'hs_2',
        name: 'Crow Pose / Frog Stand Balance',
        target: '3 x 30s Hold',
        primaryMuscles: ['Wrist Stabilizers', 'Triceps', 'Core'],
        cues: [
          'Grip ground with fingers spread wide (Spider-Man hands)',
          'Knees resting on back of triceps above elbows',
          'Gaze forward 1 foot on floor, lean shoulders past wrists'
        ],
        pitfalls: ['Looking back between feet', 'Slipping off wet arms'],
        type: 'hold',
        animationType: 'crow_pose'
      },
      {
        level: 3,
        id: 'hs_3',
        name: 'Chest-To-Wall Handstand Hold',
        target: '3 x 45s Alignment Hold',
        primaryMuscles: ['Trapezius (Elevation)', 'Anterior Delts', 'Glutes'],
        cues: [
          'Walk feet up wall with hands close (4-8 inches from wall)',
          'Point toes, elevate shoulders into ears (push earth away)',
          'Tuck chin slightly, gaze at thumbs/wrists'
        ],
        pitfalls: ['Banana arch (back arched away from wall)', 'Bent elbows'],
        type: 'hold',
        animationType: 'hs_wall'
      },
      {
        level: 4,
        id: 'hs_4',
        name: 'Wall Toe/Heel Taps & Finger Kick Drills',
        target: '3 x 10 Taps / 30s Soft Holds',
        primaryMuscles: ['Fingertip Flexors', 'Shoulder Girdle', 'Core'],
        cues: [
          'In chest-to-wall position, press fingertips into floor to float feet off',
          'Alternate subtle toe taps against wall without bending hips',
          'Learn to use fingers as brakes when over-balancing'
        ],
        pitfalls: ['Piking at hips to pull off wall', 'Panicking on bailouts'],
        type: 'hold',
        animationType: 'hs_wall_taps'
      },
      {
        level: 5,
        id: 'hs_5',
        name: 'Freestanding Kick-Up & Balance Hold',
        target: '3 x 15s Freestanding Hold',
        primaryMuscles: ['Full Body Chain', 'Wrists/Fingers', 'Shoulders'],
        cues: [
          'Lunge kick-up entry with straight arms locked out before feet leave floor',
          'Re-balance using wrist flexing (fingers for over-balance, heel of hand for under-balance)',
          'Keep glutes and legs squeezed tight into single pencil line'
        ],
        pitfalls: ['Bending elbows upon landing', 'Relaxing core mid-hold'],
        type: 'hold',
        animationType: 'hs_freestanding'
      }
    ]
  },
  {
    id: 'pistol_squat',
    title: 'Single-Leg Pistol Squat Track',
    description: 'Master knee resilience, single-leg power, and ankle mobility from air squats to full pistols.',
    color: 'rose',
    badge: 'Leg Mastery',
    levels: [
      {
        level: 1,
        id: 'leg_1',
        name: 'Deep Bodyweight Air Squats',
        target: '3 x 20 Full Range Reps',
        primaryMuscles: ['Quads', 'Glutes', 'Calves'],
        cues: [
          'Knees tracking in line with toes',
          'Hips descend below knee crease',
          'Keep heels glued to floor and chest tall'
        ],
        pitfalls: ['Heels lifting off ground', 'Knees caving inward'],
        type: 'reps',
        animationType: 'pistol_squat'
      },
      {
        level: 2,
        id: 'leg_2',
        name: 'Assisted Single-Leg Step-Downs',
        target: '3 x 10 Reps / Leg',
        primaryMuscles: ['Vastus Medialis (VMO)', 'Glute Medius'],
        cues: [
          'Stand on box/step, lower trailing leg with a slow 3-second descent',
          'Touch trailing heel softly to floor without bouncing',
          'Keep knee aligned straight over toe'
        ],
        pitfalls: ['Plummeting down quickly', 'Knee collapsing inward'],
        type: 'reps',
        animationType: 'pistol_squat'
      },
      {
        level: 3,
        id: 'leg_3',
        name: 'Bench / Chair Pistol Squats',
        target: '3 x 8 Reps / Leg',
        primaryMuscles: ['Quads', 'Hip Flexors', 'Core'],
        cues: [
          'Extend non-working leg straight out in front',
          'Lower hips gently to seat without rocking momentum',
          'Drive through working heel to stand up'
        ],
        pitfalls: ['Bouncing off bench', 'Dropping non-working leg'],
        type: 'reps',
        animationType: 'pistol_squat'
      },
      {
        level: 4,
        id: 'leg_4',
        name: 'Counter-Weighted Pistol Squats',
        target: '3 x 6 Reps / Leg',
        primaryMuscles: ['Quads', 'Ankle Mobility', 'Glutes'],
        cues: [
          'Hold light weight or shoe out in front as a counter-balance',
          'Sit deep into bottom position with full ankle flexion',
          'Keep extended leg elevated off floor'
        ],
        pitfalls: ['Rounding lower back excessively', 'Heel popping up'],
        type: 'reps',
        animationType: 'pistol_squat'
      },
      {
        level: 5,
        id: 'leg_5',
        name: 'Full Freestanding Pistol Squat',
        target: '3 x 5 Unassisted Reps / Leg',
        primaryMuscles: ['Quads', 'Full Leg Chain', 'Ankle Mobility'],
        cues: [
          'Full depth single leg squat without holding any weights',
          'Reach arms forward to assist balance',
          'Drive up smoothly through mid-foot and heel'
        ],
        pitfalls: ['Heel coming off ground', 'Losing balance at bottom'],
        type: 'reps',
        animationType: 'pistol_squat'
      }
    ]
  },
  {
    id: 'muscle_up',
    title: 'Bar Muscle-Up Pathway',
    description: 'Transition from pulling strength to explosive upper body turnover over the bar.',
    color: 'purple',
    badge: 'Explosive Power',
    levels: [
      {
        level: 1,
        id: 'mu_1',
        name: 'High Chest-To-Bar Pull-Ups',
        target: '3 x 8 Explosive Reps',
        primaryMuscles: ['Lats', 'Upper Back', 'Core'],
        cues: [
          'Pull aggressively past chin to touch chest/nipples to bar',
          'Drive elbows back aggressively'
        ],
        pitfalls: ['Pulling only to chin level'],
        type: 'reps',
        animationType: 'strict_pullup'
      },
      {
        level: 2,
        id: 'mu_2',
        name: 'Straight Bar Dips',
        target: '3 x 10 Full Lockout Reps',
        primaryMuscles: ['Triceps', 'Lower Chest', 'Serratus'],
        cues: [
          'Lean shoulders forward over bar during descent',
          'Touch lower chest/stomach to bar before pressing to lockout'
        ],
        pitfalls: ['Incomplete lockout at top'],
        type: 'reps',
        animationType: 'pushup_standard'
      },
      {
        level: 3,
        id: 'mu_3',
        name: 'Kipping Cast & Knee Drive Drills',
        target: '3 x 5 Swing Transitions',
        primaryMuscles: ['Core', 'Lats', 'Hip Flexors'],
        cues: [
          'Cast outward away from bar into arch position',
          'Drive knees up and pull bar down toward hips'
        ],
        pitfalls: ['Pulling straight up instead of around bar'],
        type: 'reps',
        animationType: 'muscle_up'
      },
      {
        level: 4,
        id: 'mu_4',
        name: 'Band-Assisted Bar Muscle-Up',
        target: '3 x 5 Assisted Transitions',
        primaryMuscles: ['Full Upper Body Chain'],
        cues: [
          'Loop resistance band around foot/knee',
          'Lean chest forward over bar as soon as pull reaches chest height'
        ],
        pitfalls: ['One-arm chicken-winging over bar'],
        type: 'reps',
        animationType: 'muscle_up'
      },
      {
        level: 5,
        id: 'mu_5',
        name: 'Strict / Clean Bar Muscle-Up',
        target: '3 x 3 Strict Reps',
        primaryMuscles: ['Lats', 'Chest', 'Triceps', 'Core'],
        cues: [
          'Explosive pull to chest',
          'Rapid forward wrist flip and shoulder lean over bar',
          'Press to full arm extension'
        ],
        pitfalls: ['Uneven arm transition', 'Kicking legs wildly'],
        type: 'reps',
        animationType: 'muscle_up'
      }
    ]
  },
  {
    id: 'lsit_core',
    title: 'L-Sit & Compression Core',
    description: 'Master hip flexor compression, active rectus abdominis strength, and straight-arm support.',
    color: 'teal',
    badge: 'Core Tension',
    levels: [
      {
        level: 1,
        id: 'lsit_1',
        name: 'Seated Pike Compression Lifts',
        target: '3 x 15 Reps',
        primaryMuscles: ['Hip Flexors', 'Lower Abs'],
        cues: [
          'Sit on floor with legs straight out in front',
          'Place hands on floor by knees, flex feet, and lift heels off floor',
          'Keep spine upright without leaning back'
        ],
        pitfalls: ['Leaning backward to cheat lift'],
        type: 'reps',
        animationType: 'seated_pike_compression'
      },
      {
        level: 2,
        id: 'lsit_2',
        name: 'Tuck L-Sit Hold (Parallettes / Floor)',
        target: '3 x 20s Hold',
        primaryMuscles: ['Abs', 'Triceps', 'Serratus'],
        cues: [
          'Push hands into parallettes or floor to depress shoulders',
          'Pull knees tight into chest with knees bent 90 degrees'
        ],
        pitfalls: ['Shoulders shrugging into ears'],
        type: 'hold',
        animationType: 'lsit_support'
      },
      {
        level: 3,
        id: 'lsit_3',
        name: 'Single-Leg Extended L-Sit',
        target: '3 x 15s Hold / Leg',
        primaryMuscles: ['Hip Flexors', 'Quads', 'Core'],
        cues: [
          'Extend one leg completely straight while keeping other knee tucked',
          'Lock elbows straight'
        ],
        pitfalls: ['Extended leg dipping below horizontal'],
        type: 'hold',
        animationType: 'lsit_support'
      },
      {
        level: 4,
        id: 'lsit_4',
        name: 'Full Freestanding L-Sit Hold',
        target: '3 x 15s Hold',
        primaryMuscles: ['Rectus Abdominis', 'Quads', 'Triceps'],
        cues: [
          'Both legs extended straight out parallel to ground',
          'Squeeze quads tight, point toes',
          'Push ground away aggressively'
        ],
        pitfalls: ['Legs sagging toward floor'],
        type: 'hold',
        animationType: 'lsit_support'
      },
      {
        level: 5,
        id: 'lsit_5',
        name: 'V-Sit / High Compression L-Sit',
        target: '3 x 10s Hold',
        primaryMuscles: ['Upper/Lower Abs', 'Hip Flexors', 'Quads'],
        cues: [
          'Drive feet upward toward ceiling past 90 degrees',
          'Maintain straight elbows and intense core compression'
        ],
        pitfalls: ['Bending knees'],
        type: 'hold',
        animationType: 'vsit_compression'
      }
    ]
  }
];

// --- AUTHENTICATION MODAL COMPONENT ---
function AuthModal({ onClose }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    setLoading(true);

    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      onClose();
    } catch (err) {
      setAuthError(err.message.replace('Firebase: ', ''));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full overflow-hidden shadow-2xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Account Portal</span>
            <h3 className="text-base font-bold text-slate-100">{isSignUp ? 'Create New Account' : 'Sign In'}</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {authError && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{authError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500 font-medium"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500 font-medium"
                required
                minLength={6}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-xl transition shadow-lg shadow-emerald-500/20 disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : isSignUp ? 'Register Account' : 'Sign In'}
          </button>
        </form>

        <div className="text-center pt-2">
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setAuthError('');
            }}
            className="text-xs text-slate-400 hover:text-emerald-400 transition"
          >
            {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Create one"}
          </button>
        </div>
      </div>
    </div>
  );
}

// --- SET LOGGER & EDIT MODAL COMPONENT ---
function LogSetModal({ levelData, trackId, restDuration, initialSetData, onClose, onSave, onStartTimer }) {
  const [reps, setReps] = useState(initialSetData ? initialSetData.repsOrHold : (levelData?.type === 'hold' ? '30s' : '8'));
  const [rpe, setRpe] = useState(initialSetData ? initialSetData.rpe : '8');
  const [formQuality, setFormQuality] = useState(initialSetData ? initialSetData.formRating : 'Clean');
  const [setNote, setSetNote] = useState(initialSetData ? (initialSetData.notes || '') : '');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      id: initialSetData ? initialSetData.id : Date.now(),
      trackId: trackId || (initialSetData ? initialSetData.trackId : ''),
      exerciseName: levelData ? levelData.name : initialSetData.exerciseName,
      repsOrHold: reps,
      rpe,
      formRating: formQuality,
      notes: setNote,
      timestamp: initialSetData ? initialSetData.timestamp : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
    if (!initialSetData) {
      onStartTimer(restDuration);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full overflow-hidden shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in duration-150">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">{initialSetData ? 'Edit Set' : 'Log Set & Start Rest'}</span>
            <h3 className="text-base font-bold text-slate-100">{levelData ? levelData.name : initialSetData?.exerciseName}</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Actual Reps / Hold:</label>
            <input
              type="text"
              value={reps}
              onChange={(e) => setReps(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500 font-bold"
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">RPE / Effort (1-10):</label>
            <select
              value={rpe}
              onChange={(e) => setRpe(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500 font-medium"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                <option key={n} value={n}>RPE {n} {n >= 9 ? '(Max Effort)' : n >= 7 ? '(Hard)' : '(Moderate)'}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Form Quality:</label>
            <div className="grid grid-cols-3 gap-2">
              {['Clean', 'Good', 'Struggled'].map(q => (
                <button
                  type="button"
                  key={q}
                  onClick={() => setFormQuality(q)}
                  className={`py-2 rounded-xl text-xs font-bold border transition ${
                    formQuality === q
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Set Notes (Optional):</label>
            <input
              type="text"
              placeholder="e.g. narrow grip felt stronger..."
              value={setNote}
              onChange={(e) => setSetNote(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl border border-slate-700 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-xl transition shadow-lg shadow-emerald-500/20"
            >
              {initialSetData ? 'Update Set' : `Save & Rest (${restDuration}s)`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// --- DISTINCT ANIMATED FORM DEMO COMPONENT ---
function ExerciseFormVisualizer({ exercise, onClose }) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setPhase(p => (p === 0 ? 1 : 0));
    }, 1800);
    return () => clearInterval(timer);
  }, []);

  const renderAnimation = () => {
    const isPhase1 = phase === 1;

    switch (exercise.animationType) {
      case 'one_arm_pushup':
        return (
          <svg className="w-full h-64 bg-slate-950 rounded-xl border border-slate-800" viewBox="0 0 300 240">
            <line x1="30" y1="180" x2="270" y2="180" stroke="#475569" strokeWidth="4" />
            <g className="transition-all duration-1000 ease-in-out">
              <circle cx="105" cy="180" r="6" fill="#f59e0b" />
              <line x1="105" y1="180" x2={isPhase1 ? "100" : "105"} y2={isPhase1 ? "160" : "130"} stroke="#f59e0b" strokeWidth="6" strokeLinecap="round" />
              <circle cx={isPhase1 ? "82" : "78"} cy={isPhase1 ? "148" : "112"} r="12" fill="#38bdf8" />
              <line x1={isPhase1 ? "92" : "88"} y1={isPhase1 ? "154" : "118"} x2="220" y2={isPhase1 ? "175" : "165"} stroke="#38bdf8" strokeWidth="8" strokeLinecap="round" />
              <path d={isPhase1 ? "M 130 156 Q 140 148 150 162" : "M 130 120 Q 140 112 150 126"} fill="none" stroke="#64748b" strokeWidth="4" strokeLinecap="round" />
              <circle cx="215" cy="180" r="4" fill="#94a3b8" />
              <circle cx="230" cy="180" r="4" fill="#94a3b8" />
            </g>
            <text x="150" y="222" textAnchor="middle" fill="#94a3b8" fontSize="11" fontFamily="sans-serif">
              {isPhase1 ? "▼ Full Depth: Chest 1 Inch Off Floor (Square Hips)" : "▲ Single-Arm Lockout (Tuck Opposite Hand)"}
            </text>
          </svg>
        );

      case 'dragon_squat':
        return (
          <svg className="w-full h-64 bg-slate-950 rounded-xl border border-slate-800" viewBox="0 0 300 240">
            <line x1="30" y1="200" x2="270" y2="200" stroke="#475569" strokeWidth="4" />
            <g className="transition-all duration-1000 ease-in-out">
              <circle cx="120" cy="200" r="5" fill="#f59e0b" />
              <line x1="120" y1="200" x2="105" y2={isPhase1 ? "180" : "155"} stroke="#38bdf8" strokeWidth="7" strokeLinecap="round" />
              <line x1="105" y1={isPhase1 ? "180" : "155"} x2="135" y2={isPhase1 ? "170" : "120"} stroke="#38bdf8" strokeWidth="8" strokeLinecap="round" />
              <circle cx={isPhase1 ? "130" : "135"} cy={isPhase1 ? "150" : "100"} r="12" fill="#38bdf8" />
              <line x1={isPhase1 ? "130" : "135"} y1={isPhase1 ? "170" : "125"} x2="225" y2={isPhase1 ? "165" : "140"} stroke="#10b981" strokeWidth="6" strokeLinecap="round" />
              <circle cx="225" cy={isPhase1 ? "165" : "140"} r="4" fill="#10b981" />
            </g>
            <text x="150" y="225" textAnchor="middle" fill="#94a3b8" fontSize="11" fontFamily="sans-serif">
              {isPhase1 ? "▼ Bottom Dragon Squat: Rear Leg Swept Out Sideways" : "▲ Drive Through Working Heel to Lockout"}
            </text>
          </svg>
        );

      case 'hollow_body':
        return (
          <svg className="w-full h-64 bg-slate-950 rounded-xl border border-slate-800" viewBox="0 0 300 240">
            <line x1="30" y1="180" x2="270" y2="180" stroke="#475569" strokeWidth="4" />
            <g className="transition-all duration-1000 ease-in-out">
              <circle cx="70" cy="162" r="12" fill="#38bdf8" />
              <line x1="70" y1="162" x2="35" y2={isPhase1 ? "152" : "158"} stroke="#10b981" strokeWidth="5" strokeLinecap="round" />
              <line x1="82" y1="168" x2="160" y2="174" stroke="#38bdf8" strokeWidth="8" strokeLinecap="round" />
              <circle cx="120" cy="170" r="14" fill="#f59e0b" opacity="0.5" />
              <line x1="160" y1="174" x2="245" y2={isPhase1 ? "145" : "155"} stroke="#38bdf8" strokeWidth="7" strokeLinecap="round" />
            </g>
            <text x="150" y="220" textAnchor="middle" fill="#94a3b8" fontSize="11" fontFamily="sans-serif">
              {isPhase1 ? "▲ Peak PPT: Lower Back Pressed Flat to Floor" : "► Extended Hollow Hold Line"}
            </text>
          </svg>
        );

      case 'crow_pose':
        return (
          <svg className="w-full h-64 bg-slate-950 rounded-xl border border-slate-800" viewBox="0 0 300 240">
            <line x1="30" y1="200" x2="270" y2="200" stroke="#475569" strokeWidth="4" />
            <g className="transition-all duration-1000 ease-in-out">
              <circle cx="130" cy="200" r="6" fill="#f59e0b" />
              <circle cx="160" cy="200" r="6" fill="#f59e0b" />
              <line x1="130" y1="200" x2="135" y2="160" stroke="#3b82f6" strokeWidth="6" strokeLinecap="round" />
              <line x1="160" y1="200" x2="155" y2="160" stroke="#3b82f6" strokeWidth="6" strokeLinecap="round" />
              <circle cx="115" cy="140" r="12" fill="#38bdf8" />
              <line x1="125" y1="145" x2="165" y2="135" stroke="#38bdf8" strokeWidth="8" strokeLinecap="round" />
              <ellipse cx="150" cy="148" rx="14" ry="10" fill="#10b981" opacity="0.8" />
              <circle cx={isPhase1 ? "185" : "180"} cy="140" r="5" fill="#10b981" />
            </g>
            <text x="150" y="225" textAnchor="middle" fill="#94a3b8" fontSize="11" fontFamily="sans-serif">
              {isPhase1 ? "◄ Lean Forward Past Wrists & Grip Floor" : "▲ Feet Off Ground & Knees Anchored"}
            </text>
          </svg>
        );

      case 'hs_wall':
        return (
          <svg className="w-full h-64 bg-slate-950 rounded-xl border border-slate-800" viewBox="0 0 300 240">
            <line x1="30" y1="210" x2="270" y2="210" stroke="#475569" strokeWidth="4" />
            <line x1="200" y1="20" x2="200" y2="210" stroke="#f59e0b" strokeWidth="5" strokeDasharray="4" />
            <g className="transition-all duration-1000 ease-in-out">
              <circle cx="180" cy="210" r="6" fill="#10b981" />
              <line x1="180" y1="210" x2="185" y2="150" stroke="#38bdf8" strokeWidth="6" strokeLinecap="round" />
              <circle cx="175" cy="160" r="11" fill="#38bdf8" />
              <line x1="185" y1="150" x2="195" y2="40" stroke="#38bdf8" strokeWidth="8" strokeLinecap="round" />
              <circle cx="198" cy="35" r="4" fill="#f59e0b" />
            </g>
            <text x="150" y="232" textAnchor="middle" fill="#94a3b8" fontSize="11" fontFamily="sans-serif">
              {isPhase1 ? "▲ Shrug Shoulders into Ears against Wall" : "► Straight Alignment Line"}
            </text>
          </svg>
        );

      case 'hs_wall_taps':
        return (
          <svg className="w-full h-64 bg-slate-950 rounded-xl border border-slate-800" viewBox="0 0 300 240">
            <line x1="30" y1="210" x2="270" y2="210" stroke="#475569" strokeWidth="4" />
            <line x1="210" y1="20" x2="210" y2="210" stroke="#64748b" strokeWidth="4" strokeDasharray="4" />
            <g className="transition-all duration-1000 ease-in-out">
              <circle cx="170" cy="210" r="6" fill="#10b981" />
              <line x1="170" y1="210" x2="175" y2="150" stroke="#38bdf8" strokeWidth="6" strokeLinecap="round" />
              <line x1="175" y1="150" x2="185" y2="40" stroke="#38bdf8" strokeWidth="8" strokeLinecap="round" />
              <circle cx={isPhase1 ? "180" : "210"} cy="35" r="5" fill="#f59e0b" />
              <circle cx={isPhase1 ? "210" : "180"} cy="35" r="5" fill="#10b981" />
            </g>
            <text x="150" y="232" textAnchor="middle" fill="#94a3b8" fontSize="11" fontFamily="sans-serif">
              {isPhase1 ? "◄ Fingertip Pressure Floats Feet off Wall" : "► Tap Wall Gently with Alternating Toes"}
            </text>
          </svg>
        );

      case 'hs_freestanding':
        return (
          <svg className="w-full h-64 bg-slate-950 rounded-xl border border-slate-800" viewBox="0 0 300 240">
            <line x1="30" y1="210" x2="270" y2="210" stroke="#475569" strokeWidth="4" />
            <g className="transition-all duration-1000 ease-in-out">
              <circle cx="130" cy="210" r="6" fill="#f59e0b" />
              <circle cx="170" cy="210" r="6" fill="#f59e0b" />
              <circle cx="130" cy="210" r={isPhase1 ? "11" : "6"} fill="none" stroke="#f59e0b" strokeWidth="1.5" />
              <circle cx="170" cy="210" r={isPhase1 ? "11" : "6"} fill="none" stroke="#f59e0b" strokeWidth="1.5" />
              <line x1="150" y1="210" x2="150" y2="150" stroke="#f59e0b" strokeWidth="6" strokeLinecap="round" />
              <circle cx="150" cy="165" r="12" fill="#38bdf8" />
              <line x1="150" y1="140" x2="150" y2="80" stroke="#38bdf8" strokeWidth="8" strokeLinecap="round" />
              <line x1="150" y1="80" x2={isPhase1 ? "148" : "152"} y2="25" stroke="#38bdf8" strokeWidth="7" strokeLinecap="round" />
              <circle cx={isPhase1 ? "148" : "152"} cy="20" r="4" fill="#10b981" />
            </g>
            <text x="150" y="232" textAnchor="middle" fill="#94a3b8" fontSize="11" fontFamily="sans-serif">
              {isPhase1 ? "◄ Claw Fingertips (Overbalance)" : "► Press Heel of Hand (Underbalance)"}
            </text>
          </svg>
        );

      case 'seated_pike_compression':
        return (
          <svg className="w-full h-64 bg-slate-950 rounded-xl border border-slate-800" viewBox="0 0 300 240">
            <line x1="30" y1="190" x2="270" y2="190" stroke="#475569" strokeWidth="4" />
            <g className="transition-all duration-1000 ease-in-out">
              <line x1="100" y1="190" x2="100" y2="120" stroke="#38bdf8" strokeWidth="8" strokeLinecap="round" />
              <circle cx="100" cy="105" r="12" fill="#38bdf8" />
              <circle cx="140" cy="190" r="5" fill="#f59e0b" />
              <line x1="100" y1="140" x2="140" y2="190" stroke="#3b82f6" strokeWidth="5" strokeLinecap="round" />
              <line x1="100" y1="190" x2="220" y2={isPhase1 ? "150" : "185"} stroke="#10b981" strokeWidth="7" strokeLinecap="round" />
              <circle cx="115" cy="180" r="10" fill="#f59e0b" opacity="0.6" />
            </g>
            <text x="150" y="222" textAnchor="middle" fill="#94a3b8" fontSize="11" fontFamily="sans-serif">
              {isPhase1 ? "▲ Peak Hip Flexor & Abs Compression Lift" : "▼ Control Heels Softly Above Floor"}
            </text>
          </svg>
        );

      case 'lsit_support':
      case 'vsit_compression':
        return (
          <svg className="w-full h-64 bg-slate-950 rounded-xl border border-slate-800" viewBox="0 0 300 240">
            <rect x="100" y="170" width="12" height="30" fill="#475569" rx="2" />
            <rect x="140" y="170" width="12" height="30" fill="#475569" rx="2" />
            <line x1="30" y1="200" x2="270" y2="200" stroke="#334155" strokeWidth="3" />
            <g className="transition-all duration-1000 ease-in-out">
              <line x1="126" y1="170" x2="126" y2="120" stroke="#3b82f6" strokeWidth="6" strokeLinecap="round" />
              <circle cx="126" cy="105" r="13" fill="#38bdf8" />
              <line x1="126" y1="118" x2="126" y2="160" stroke="#38bdf8" strokeWidth="8" strokeLinecap="round" />
              <line x1="126" y1="160" x2="215" y2={exercise.animationType === 'vsit_compression' ? (isPhase1 ? "90" : "110") : (isPhase1 ? "150" : "160")} stroke="#10b981" strokeWidth="7" strokeLinecap="round" />
            </g>
            <text x="150" y="225" textAnchor="middle" fill="#94a3b8" fontSize="11" fontFamily="sans-serif">
              {exercise.animationType === 'vsit_compression' ? "▲ V-Sit Compression: Legs Driven Past 90°" : "► Full L-Sit Parallel Leg Hold"}
            </text>
          </svg>
        );

      case 'pistol_squat':
        return (
          <svg className="w-full h-64 bg-slate-950 rounded-xl border border-slate-800" viewBox="0 0 300 240">
            <line x1="30" y1="200" x2="270" y2="200" stroke="#475569" strokeWidth="4" />
            <g className="transition-all duration-1000 ease-in-out">
              <circle cx="120" cy="200" r="5" fill="#f59e0b" />
              <line x1="120" y1="200" x2="110" y2={isPhase1 ? "175" : "150"} stroke="#38bdf8" strokeWidth="7" strokeLinecap="round" />
              <line x1="110" y1={isPhase1 ? "175" : "150"} x2="130" y2={isPhase1 ? "170" : "115"} stroke="#38bdf8" strokeWidth="8" strokeLinecap="round" />
              <circle cx={isPhase1 ? "125" : "130"} cy={isPhase1 ? "152" : "98"} r="12" fill="#38bdf8" />
              <line x1={isPhase1 ? "125" : "130"} y1={isPhase1 ? "172" : "120"} x2="210" y2={isPhase1 ? "172" : "130"} stroke="#10b981" strokeWidth="6" strokeLinecap="round" />
            </g>
            <text x="150" y="225" textAnchor="middle" fill="#94a3b8" fontSize="11" fontFamily="sans-serif">
              {isPhase1 ? "▼ Bottom Pistol Squat: Full Ankle Flexion" : "▲ Top Single-Leg Lockout"}
            </text>
          </svg>
        );

      case 'muscle_up':
        return (
          <svg className="w-full h-64 bg-slate-950 rounded-xl border border-slate-800" viewBox="0 0 300 240">
            <line x1="50" y1="90" x2="250" y2="90" stroke="#64748b" strokeWidth="8" strokeLinecap="round" />
            <g className="transition-all duration-1000 ease-in-out">
              <circle cx="130" cy="90" r="5" fill="#10b981" />
              <circle cx="170" cy="90" r="5" fill="#10b981" />
              <circle cx="150" cy={isPhase1 ? "50" : "130"} r="13" fill="#38bdf8" />
              <line x1="150" y1={isPhase1 ? "63" : "143"} x2="150" y2={isPhase1 ? "125" : "195"} stroke="#38bdf8" strokeWidth="8" strokeLinecap="round" />
            </g>
            <text x="150" y="225" textAnchor="middle" fill="#94a3b8" fontSize="11" fontFamily="sans-serif">
              {isPhase1 ? "▲ Lockout Above Bar: Lean Shoulders Forward" : "▼ Explosive Pull & Hip Transition"}
            </text>
          </svg>
        );

      case 'pushup_standard':
      case 'pushup_diamond':
      case 'pushup_pppu':
      case 'pushup_archer':
      default:
        return (
          <svg className="w-full h-64 bg-slate-950 rounded-xl border border-slate-800" viewBox="0 0 300 240">
            <line x1="30" y1="180" x2="270" y2="180" stroke="#475569" strokeWidth="4" />
            <g className="transition-all duration-1000 ease-in-out">
              <circle cx="100" cy="180" r="5" fill="#3b82f6" />
              <line x1="100" y1="180" x2="100" y2={isPhase1 ? "160" : "130"} stroke="#3b82f6" strokeWidth="6" strokeLinecap="round" />
              <circle cx={isPhase1 ? "80" : "75"} cy={isPhase1 ? "145" : "110"} r="13" fill="#38bdf8" />
              <line x1="90" y1="85" x2="220" y2={isPhase1 ? "175" : "165"} stroke="#38bdf8" strokeWidth="9" strokeLinecap="round" />
              <circle cx="220" cy="180" r="4" fill="#94a3b8" />
            </g>
            <text x="150" y="220" textAnchor="middle" fill="#94a3b8" fontSize="11" fontFamily="sans-serif">
              {isPhase1 ? "▼ Full Depth: Chest 1 Inch Off Floor" : "▲ Scapular Protraction Lockout"}
            </text>
          </svg>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
              Biomechanical Visualizer
            </span>
            <h3 className="text-lg font-bold text-slate-100 mt-1">{exercise.name}</h3>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-200 rounded-xl hover:bg-slate-800 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {renderAnimation()}

          <div>
            <span className="text-xs font-semibold text-slate-400 block mb-2">Targeted Muscle Groups:</span>
            <div className="flex flex-wrap gap-2">
              {exercise.primaryMuscles?.map((m, i) => (
                <span key={i} className="text-xs bg-slate-800 text-slate-200 px-2.5 py-1 rounded-lg border border-slate-700 font-medium flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  {m}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block mb-2">Non-Negotiable Execution Cues</span>
            <ul className="space-y-2 text-xs text-slate-300">
              {exercise.cues.map((cue, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{cue}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="p-4 bg-slate-950/60 border-t border-slate-800 text-right">
          <button onClick={onClose} className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition">
            Close Visualizer
          </button>
        </div>
      </div>
    </div>
  );
}

// --- ROUTINE BUILDER MODAL COMPONENT ---
function RoutineBuilderModal({ onClose, onSave }) {
  const [routineName, setRoutineName] = useState('');
  const [restSeconds, setRestSeconds] = useState(90);
  const [selectedItems, setSelectedItems] = useState([]);

  const handleToggleExercise = (track, level) => {
    const exists = selectedItems.find(i => i.trackId === track.id && i.level === level.level);
    if (exists) {
      setSelectedItems(selectedItems.filter(i => !(i.trackId === track.id && i.level === level.level)));
    } else {
      setSelectedItems([...selectedItems, { trackId: track.id, trackTitle: track.title, level: level.level, name: level.name, target: level.target }]);
    }
  };

  const handleSaveRoutine = (e) => {
    e.preventDefault();
    if (!routineName.trim() || selectedItems.length === 0) return;
    onSave({
      id: Date.now(),
      name: routineName,
      restDuration: Number(restSeconds),
      items: selectedItems
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full overflow-hidden shadow-2xl p-6 space-y-4 my-8">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Template Creator</span>
            <h3 className="text-lg font-bold text-slate-100">Build Custom Workout Routine</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSaveRoutine} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Routine Name (e.g. Push Day A, Heavy Pull):</label>
            <input
              type="text"
              placeholder="e.g. Upper Body Hypertrophy"
              value={routineName}
              onChange={(e) => setRoutineName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500 font-bold"
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Default Rest Between Sets:</label>
            <select
              value={restSeconds}
              onChange={(e) => setRestSeconds(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500 font-medium"
            >
              <option value={45}>45 Seconds (Fast Pace)</option>
              <option value={60}>60 Seconds (Standard)</option>
              <option value={90}>90 Seconds (Strength & Hypertrophy)</option>
              <option value={120}>2 Minutes (Heavy Effort)</option>
              <option value={180}>3 Minutes (Max Strength / Skill)</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-2">Select Exercises to Include in Routine:</label>
            <div className="max-h-60 overflow-y-auto space-y-3 pr-2 border border-slate-800 rounded-xl p-3 bg-slate-950/60">
              {PROGRESSION_TRACKS.map(track => (
                <div key={track.id} className="space-y-1.5">
                  <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">{track.title}</span>
                  <div className="grid gap-1">
                    {track.levels.map(lvl => {
                      const isSelected = selectedItems.some(i => i.trackId === track.id && i.level === lvl.level);
                      return (
                        <div
                          key={lvl.level}
                          onClick={() => handleToggleExercise(track, lvl)}
                          className={`text-xs p-2.5 rounded-lg border cursor-pointer flex items-center justify-between transition ${
                            isSelected
                              ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-200 font-bold'
                              : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                          }`}
                        >
                          <span>Lvl {lvl.level}: {lvl.name}</span>
                          <span className="text-[10px] text-slate-400">{lvl.target}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl border border-slate-700 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={selectedItems.length === 0 || !routineName.trim()}
              className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition shadow-lg ${
                selectedItems.length > 0 && routineName.trim()
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              Save Routine ({selectedItems.length} exercises)
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// --- MAIN APP COMPONENT ---
export default function App() {
  const [activeTab, setActiveTab] = useState('roadmap');
  const [user, setUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const [userLevels, setUserLevels] = useState({
    one_arm_pushup: 1,
    dragon_squat: 1,
    pulling: 2,
    pushing: 2,
    handstand: 1,
    pistol_squat: 1,
    muscle_up: 1,
    lsit_core: 1
  });

  const [activeWorkout, setActiveWorkout] = useState({
    date: new Date().toISOString().split('T')[0],
    title: 'Calisthenics Progression Session',
    sets: [],
    restDuration: 90
  });
  const [sessionNotes, setSessionNotes] = useState('');
  const [workoutHistory, setWorkoutHistory] = useState([]);
  const [selectedExerciseDemo, setSelectedExerciseDemo] = useState(null);
  const [loggingExercise, setLoggingExercise] = useState(null);
  const [editingSet, setEditingSet] = useState(null);
  const [routines, setRoutines] = useState([
    {
      id: 1,
      name: 'Push Day Mastery',
      restDuration: 90,
      items: [
        { trackId: 'pushing', level: 2, name: 'Strict Standard Push-Ups', target: '3 x 20 Crisp Reps' },
        { trackId: 'one_arm_pushup', level: 1, name: 'Incline One-Arm Push-Ups', target: '3 x 10 Clean Reps / Arm' }
      ]
    },
    {
      id: 2,
      name: 'Pull & Core Session',
      restDuration: 90,
      items: [
        { trackId: 'pulling', level: 4, name: 'Strict Dead-Stop Pull-Ups', target: '3 x 8 Clean Reps' },
        { trackId: 'lsit_core', level: 2, name: 'Tuck L-Sit Hold (Parallettes / Floor)', target: '3 x 20s Hold' }
      ]
    }
  ]);
  const [isBuildingRoutine, setIsBuildingRoutine] = useState(false);

  // Timer State
  const [timerSeconds, setTimerSeconds] = useState(90);
  const [timerInitial, setTimerInitial] = useState(90);
  const [timerActive, setTimerActive] = useState(false);
  const audioCtxRef = useRef(null);

  // Auth observer
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        signInAnonymously(auth).catch(() => {});
      }
    });
    return () => unsubscribe();
  }, []);

  // Sync with Firestore per authenticated user
  useEffect(() => {
    if (!user) return;

    // Load History
    const sessionsRef = collection(db, 'users', user.uid, 'sessions');
    const unsubscribeSessions = onSnapshot(sessionsRef, (snapshot) => {
      const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      docs.sort((a, b) => new Date(b.createdAt || b.date || 0) - new Date(a.createdAt || a.date || 0));
      setWorkoutHistory(docs);
    });

    // Load Level Progress
    const levelsDocRef = doc(db, 'users', user.uid, 'settings', 'userLevels');
    const unsubscribeLevels = onSnapshot(levelsDocRef, (docSnap) => {
      if (docSnap.exists()) {
        setUserLevels(prev => ({ ...prev, ...docSnap.data() }));
      }
    });

    // Load Custom Routines
    const routinesDocRef = doc(db, 'users', user.uid, 'settings', 'customRoutines');
    const unsubscribeRoutines = onSnapshot(routinesDocRef, (docSnap) => {
      if (docSnap.exists() && docSnap.data().routines) {
        setRoutines(docSnap.data().routines);
      }
    });

    // Load Active Workout State
    const activeWorkoutDocRef = doc(db, 'users', user.uid, 'settings', 'activeWorkoutState');
    const unsubscribeActiveWorkout = onSnapshot(activeWorkoutDocRef, (docSnap) => {
      if (docSnap.exists() && docSnap.data().session) {
        setActiveWorkout(docSnap.data().session);
      }
    });

    return () => {
      unsubscribeSessions();
      unsubscribeLevels();
      unsubscribeRoutines();
      unsubscribeActiveWorkout();
    };
  }, [user]);

  const updateActiveWorkoutInCloud = async (newWorkoutState) => {
    setActiveWorkout(newWorkoutState);
    if (user) {
      try {
        const activeWorkoutDocRef = doc(db, 'users', user.uid, 'settings', 'activeWorkoutState');
        await setDoc(activeWorkoutDocRef, { session: newWorkoutState }, { merge: true });
      } catch (err) {
        console.error("Failed to sync active workout state:", err);
      }
    }
  };

  const saveRoutinesToFirebase = async (newRoutines) => {
    setRoutines(newRoutines);
    if (user) {
      try {
        const routinesDocRef = doc(db, 'users', user.uid, 'settings', 'customRoutines');
        await setDoc(routinesDocRef, { routines: newRoutines }, { merge: true });
      } catch (err) {
        console.error("Failed to sync routines:", err);
      }
    }
  };

  const deleteRoutine = (routineId) => {
    const updated = routines.filter(r => r.id !== routineId);
    saveRoutinesToFirebase(updated);
  };

  const playBeep = () => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch (e) {
      console.log('Audio playback prevented');
    }
  };

  useEffect(() => {
    let interval = null;
    if (timerActive && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds(sec => sec - 1);
      }, 1000);
    } else if (timerSeconds === 0 && timerActive) {
      setTimerActive(false);
      playBeep();
    }
    return () => clearInterval(interval);
  }, [timerActive, timerSeconds]);

  const startTimer = (seconds) => {
    setTimerInitial(seconds);
    setTimerSeconds(seconds);
    setTimerActive(true);
    updateActiveWorkoutInCloud({ ...activeWorkout, restDuration: seconds });
  };

  const toggleTimer = () => setTimerActive(!timerActive);
  const resetTimer = () => {
    setTimerActive(false);
    setTimerSeconds(timerInitial);
  };

  const formatTime = (totalSecs) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const updateLevel = async (trackId, newLevel) => {
    const updated = {
      ...userLevels,
      [trackId]: Math.max(1, Math.min(5, newLevel))
    };
    setUserLevels(updated);

    if (user) {
      try {
        const levelsDocRef = doc(db, 'users', user.uid, 'settings', 'userLevels');
        await setDoc(levelsDocRef, updated, { merge: true });
      } catch (err) {
        console.error("Failed to sync level:", err);
      }
    }
  };

  const adjustPlannedItemLevel = (itemIndex, direction) => {
    if (!activeWorkout.plannedItems) return;
    const items = [...activeWorkout.plannedItems];
    const currentItem = items[itemIndex];
    const track = PROGRESSION_TRACKS.find(t => t.id === currentItem.trackId);
    if (!track) return;

    const newLevelNum = Math.max(1, Math.min(5, currentItem.level + direction));
    const newLevelData = track.levels.find(l => l.level === newLevelNum);
    if (!newLevelData) return;

    items[itemIndex] = {
      ...currentItem,
      level: newLevelData.level,
      name: newLevelData.name,
      target: newLevelData.target
    };

    updateActiveWorkoutInCloud({ ...activeWorkout, plannedItems: items });
  };

  const handleSaveSet = (newSet) => {
    setActiveWorkout(prev => {
      const existingIndex = prev.sets.findIndex(s => s.id === newSet.id);
      let updatedSets;
      if (existingIndex >= 0) {
        updatedSets = [...prev.sets];
        updatedSets[existingIndex] = newSet;
      } else {
        updatedSets = [...prev.sets, newSet];
      }

      let updatedPlannedItems = prev.plannedItems;
      if (updatedPlannedItems && updatedPlannedItems.length > 0) {
        const matchIndex = updatedPlannedItems.findIndex(item => item.name === newSet.exerciseName);
        if (matchIndex >= 0) {
          updatedPlannedItems = updatedPlannedItems.filter((_, idx) => idx !== matchIndex);
        }
      }

      const nextState = {
        ...prev,
        sets: updatedSets,
        plannedItems: updatedPlannedItems && updatedPlannedItems.length > 0 ? updatedPlannedItems : null
      };

      if (user) {
        const activeWorkoutDocRef = doc(db, 'users', user.uid, 'settings', 'activeWorkoutState');
        setDoc(activeWorkoutDocRef, { session: nextState }, { merge: true }).catch(err => console.error("Cloud sync err:", err));
      }

      return nextState;
    });
  };

  const removeSet = (setId) => {
    setActiveWorkout(prev => {
      const updatedSets = prev.sets.filter(s => s.id !== setId);
      const nextState = { ...prev, sets: updatedSets };
      if (user) {
        const activeWorkoutDocRef = doc(db, 'users', user.uid, 'settings', 'activeWorkoutState');
        setDoc(activeWorkoutDocRef, { session: nextState }, { merge: true }).catch(err => console.error("Cloud sync err:", err));
      }
      return nextState;
    });
  };

  const clearRoutineChecklist = () => {
    updateActiveWorkoutInCloud({ ...activeWorkout, plannedItems: null });
  };

  const startRoutineSession = (routine) => {
    const sessionState = {
      date: new Date().toISOString().split('T')[0],
      title: routine.name,
      sets: activeWorkout.sets,
      plannedItems: routine.items,
      restDuration: routine.restDuration
    };
    updateActiveWorkoutInCloud(sessionState);
    setTimerInitial(routine.restDuration);
    setTimerSeconds(routine.restDuration);
    setActiveTab('workout');
  };

  const finishWorkout = async () => {
    if (activeWorkout.sets.length === 0) return;

    const completedSession = {
      date: activeWorkout.date,
      title: activeWorkout.title,
      setsCount: activeWorkout.sets.length,
      sets: activeWorkout.sets,
      notes: sessionNotes || '',
      createdAt: new Date().toISOString()
    };

    if (user) {
      try {
        const sessionsRef = collection(db, 'users', user.uid, 'sessions');
        await addDoc(sessionsRef, completedSession);
      } catch (err) {
        console.error("Save error:", err);
      }
    }

    updateActiveWorkoutInCloud({
      date: new Date().toISOString().split('T')[0],
      title: 'Calisthenics Progression Session',
      sets: [],
      restDuration: 90,
      plannedItems: null
    });
    setSessionNotes('');
    setActiveTab('history');
  };

  const deleteHistorySession = async (sessionId) => {
    if (user) {
      try {
        const sessionDocRef = doc(db, 'users', user.uid, 'sessions', sessionId);
        await deleteDoc(sessionDocRef);
      } catch (err) {
        console.error("Delete error:", err);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-24">
      {/* HEADER */}
      <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-tr from-emerald-500 to-teal-400 p-2 rounded-xl text-slate-950 shadow-lg shadow-emerald-500/20">
              <Zap className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                Apex Calisthenics
              </h1>
              <p className="text-xs text-slate-400 font-medium">Interactive Progression Framework</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('workout')}
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-3 py-2 rounded-xl border border-slate-700 transition"
            >
              <Dumbbell className="w-4 h-4 text-emerald-400" />
              <span>Session: <strong className="text-emerald-400">{activeWorkout.sets.length}</strong></span>
            </button>

            {user && !user.isAnonymous ? (
              <div className="flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1.5 rounded-xl border border-slate-700 text-xs">
                <UserIcon className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-slate-300 max-w-[100px] truncate">{user.email}</span>
                <button
                  onClick={() => signOut(auth)}
                  className="p-1 hover:text-rose-400 text-slate-400 ml-1 transition"
                  title="Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold px-3 py-2 rounded-xl transition shadow-md shadow-emerald-500/10"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* NAVIGATION TABS */}
      <nav className="bg-slate-900 border-b border-slate-800 px-4">
        <div className="max-w-5xl mx-auto flex overflow-x-auto space-x-1 scrollbar-none py-2">
          {[
            { id: 'roadmap', label: 'Skill Pathways', icon: Target },
            { id: 'routines', label: 'Routines', icon: Layers },
            { id: 'workout', label: 'Active Workout', icon: Activity },
            { id: 'history', label: 'Log History', icon: BarChart3 }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${
                  isActive
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </nav>

      {/* MAIN CONTAINER */}
      <main className="max-w-5xl mx-auto px-4 py-6">

        {/* --- TAB 1: ROADMAP & SKILL PATHWAYS --- */}
        {activeTab === 'roadmap' && (
          <div className="space-y-8">
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-400" />
                Interactive Progression Framework
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                Click any level button (1 to 5) on a discipline card to instantly update the active drill, non-negotiable form cues, and mastery targets.
              </p>
            </div>

            {PROGRESSION_TRACKS.map((track) => {
              const currentLevel = userLevels[track.id] || 1;
              const activeLevelData = track.levels.find(l => l.level === currentLevel) || track.levels[0];

              return (
                <div key={track.id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                  <div className="p-6 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/80">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-wider">
                          {track.badge}
                        </span>
                        <span className="text-xs text-slate-400 font-medium">Level {currentLevel} of {track.levels.length}</span>
                      </div>
                      <h3 className="text-xl font-bold text-slate-100 mt-2">{track.title}</h3>
                      <p className="text-sm text-slate-400 mt-1">{track.description}</p>
                    </div>

                    <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800 self-start md:self-auto">
                      <span className="text-xs font-semibold text-slate-400 px-2">Set Level:</span>
                      {track.levels.map((lvl) => (
                        <button
                          key={lvl.level}
                          onClick={() => updateLevel(track.id, lvl.level)}
                          className={`w-8 h-8 rounded-lg text-xs font-bold transition ${
                            userLevels[track.id] === lvl.level
                              ? 'bg-emerald-500 text-slate-950 font-black shadow-md shadow-emerald-500/20'
                              : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                          }`}
                        >
                          {lvl.level}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="p-6 bg-slate-900/40">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <div className="text-xs font-bold text-emerald-400 uppercase tracking-wide">Current Target Drill</div>
                        <h4 className="text-lg font-bold text-slate-100 mt-1 flex items-center gap-2">
                          {activeLevelData.name}
                        </h4>
                        <div className="inline-flex items-center gap-2 bg-slate-800/80 text-amber-300 px-3 py-1.5 rounded-lg text-xs font-semibold mt-2 border border-slate-700">
                          <Target className="w-3.5 h-3.5" />
                          Mastery Standard: {activeLevelData.target}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedExerciseDemo(activeLevelData)}
                          className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-4 py-2.5 rounded-xl border border-slate-700 transition text-sm"
                        >
                          <Eye className="w-4 h-4 text-amber-400" />
                          View Animated Demo
                        </button>

                        <button
                          onClick={() => setLoggingExercise({ trackId: track.id, levelData: activeLevelData })}
                          className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl transition shadow-lg shadow-emerald-500/10 text-sm whitespace-nowrap"
                        >
                          <Plus className="w-4 h-4 stroke-[3]" />
                          Log Set
                        </button>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 mt-6">
                      <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                        <div className="text-xs font-bold text-slate-300 flex items-center gap-2 mb-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          Non-Negotiable Form Cues
                        </div>
                        <ul className="space-y-2 text-xs text-slate-300">
                          {activeLevelData.cues.map((cue, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="text-emerald-400 font-bold">•</span>
                              <span>{cue}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                        <div className="text-xs font-bold text-slate-300 flex items-center gap-2 mb-2">
                          <ShieldAlert className="w-4 h-4 text-amber-400" />
                          Common Pitfalls to Avoid
                        </div>
                        <ul className="space-y-2 text-xs text-slate-300">
                          {activeLevelData.pitfalls.map((pit, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="text-amber-400 font-bold">•</span>
                              <span>{pit}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="mt-6 pt-6 border-t border-slate-800/80">
                      <div className="text-xs font-semibold text-slate-400 mb-3">Progression Continuum:</div>
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                        {track.levels.map((lvl) => {
                          const isCurrent = lvl.level === currentLevel;
                          const isPassed = lvl.level < currentLevel;

                          return (
                            <div
                              key={lvl.level}
                              onClick={() => updateLevel(track.id, lvl.level)}
                              className={`p-2.5 rounded-xl border cursor-pointer transition ${
                                isCurrent
                                  ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-300'
                                  : isPassed
                                  ? 'bg-slate-800/40 border-slate-700/50 text-slate-400'
                                  : 'bg-slate-950/40 border-slate-800/60 text-slate-500'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold uppercase tracking-wider">Lvl {lvl.level}</span>
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedExerciseDemo(lvl);
                                  }}
                                  className="text-slate-400 hover:text-amber-300"
                                >
                                  <Eye className="w-3 h-3" />
                                </button>
                              </div>
                              <div className="text-xs font-medium truncate mt-1">{lvl.name}</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* --- TAB 2: ROUTINES --- */}
        {activeTab === 'routines' && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                  <Layers className="w-5 h-5 text-emerald-400" />
                  Custom Workout Routines
                </h2>
                <p className="text-sm text-slate-400 mt-1">Pre-build your training split days (Push, Pull, Core, etc.) and rest durations. Saved directly to cloud storage.</p>
              </div>
              <button
                onClick={() => setIsBuildingRoutine(true)}
                className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl transition shadow-lg shadow-emerald-500/10 text-sm whitespace-nowrap"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                Create New Routine
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {routines.map((routine) => (
                <div key={routine.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div>
                      <h3 className="font-bold text-lg text-slate-100">{routine.name}</h3>
                      <span className="text-xs text-slate-400 font-medium">Rest interval: {routine.restDuration}s between sets</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => startRoutineSession(routine)}
                        className="flex items-center gap-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 px-3 py-1.5 rounded-xl border border-emerald-500/30 text-xs font-bold transition"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        Start
                      </button>
                      <button
                        onClick={() => deleteRoutine(routine.id)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 transition rounded-lg hover:bg-slate-800"
                        title="Delete Routine"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Planned Exercises:</span>
                    <div className="space-y-1.5">
                      {routine.items.map((item, idx) => (
                        <div key={idx} className="text-xs bg-slate-950 p-2.5 rounded-xl border border-slate-800/80 flex items-center justify-between">
                          <span className="font-bold text-slate-200">{item.name}</span>
                          <span className="text-amber-400 font-medium">{item.target}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- TAB 3: ACTIVE WORKOUT LOGGER --- */}
        {activeTab === 'workout' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
              <div>
                <h2 className="text-xl font-bold text-slate-100">{activeWorkout.title}</h2>
                <p className="text-xs text-slate-400 mt-1">Logged sets auto-save instantly to your personal Firebase cloud account.</p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={finishWorkout}
                  disabled={activeWorkout.sets.length === 0}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition ${
                    activeWorkout.sets.length > 0
                      ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  <Award className="w-4 h-4" />
                  Save & Finish Session
                </button>
              </div>
            </div>

            {/* Rest Timer Panel */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
                  <TimerIcon className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-400">Inter-Set Rest Timer</div>
                  <div className="text-3xl font-mono font-bold text-slate-100">{formatTime(timerSeconds)}</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => startTimer(60)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition ${activeWorkout.restDuration === 60 ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-bold' : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'}`}
                >
                  60s
                </button>
                <button
                  onClick={() => startTimer(90)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition ${activeWorkout.restDuration === 90 ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-bold' : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'}`}
                >
                  90s
                </button>
                <button
                  onClick={() => startTimer(180)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition ${activeWorkout.restDuration === 180 ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-bold' : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'}`}
                >
                  3 min
                </button>

                <div className="h-6 w-px bg-slate-800 mx-1" />

                <button
                  onClick={toggleTimer}
                  className={`p-2.5 rounded-xl font-bold transition ${
                    timerActive ? 'bg-amber-500 text-slate-950' : 'bg-emerald-500 text-slate-950'
                  }`}
                >
                  {timerActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>
                <button
                  onClick={resetTimer}
                  className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Planned Routine Checklist */}
            {activeWorkout.plannedItems && activeWorkout.plannedItems.length > 0 && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
                    <CheckSquare className="w-4 h-4" />
                    Routine Checklist (Tap to Log Sets)
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] text-slate-400 hidden sm:inline">Use ▲/▼ to adjust difficulty</span>
                    <button
                      onClick={clearRoutineChecklist}
                      className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-rose-400 text-xs font-bold rounded-lg border border-slate-700 transition"
                      title="Clear remaining routine checklist without affecting logged sets"
                    >
                      Clear Checklist
                    </button>
                  </div>
                </div>
                <div className="grid gap-2">
                  {activeWorkout.plannedItems.map((item, idx) => {
                    const track = PROGRESSION_TRACKS.find(t => t.id === item.trackId);
                    const levelData = track?.levels.find(l => l.level === item.level);
                    return (
                      <div key={idx} className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="flex flex-col gap-0.5">
                            <button
                              onClick={() => adjustPlannedItemLevel(idx, 1)}
                              disabled={item.level >= 5}
                              className={`p-1 rounded bg-slate-900 border border-slate-800 text-slate-300 hover:text-emerald-400 transition ${item.level >= 5 ? 'opacity-30 cursor-not-allowed' : ''}`}
                              title="Make Harder (Level Up)"
                            >
                              <ChevronUp className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => adjustPlannedItemLevel(idx, -1)}
                              disabled={item.level <= 1}
                              className={`p-1 rounded bg-slate-900 border border-slate-800 text-slate-300 hover:text-amber-400 transition ${item.level <= 1 ? 'opacity-30 cursor-not-allowed' : ''}`}
                              title="Make Easier (Level Down)"
                            >
                              <ChevronDown className="w-3 h-3" />
                            </button>
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">Lvl {item.level}</span>
                              <span className="text-xs font-bold text-slate-200">{item.name}</span>
                            </div>
                            <span className="text-[11px] text-amber-400 block mt-0.5">Target: {item.target}</span>
                          </div>
                        </div>

                        {levelData && track && (
                          <button
                            onClick={() => setLoggingExercise({ trackId: track.id, levelData })}
                            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition shadow-md shadow-emerald-500/10 self-end sm:self-auto"
                          >
                            + Log Set
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Logged Sets Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
                <h3 className="font-bold text-slate-200 text-sm">Session Set Log</h3>
                <span className="text-xs text-slate-400 font-medium">{activeWorkout.sets.length} total sets recorded</span>
              </div>

              {activeWorkout.sets.length === 0 ? (
                <div className="p-12 text-center">
                  <Dumbbell className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-400 font-medium text-sm">No sets logged yet today.</p>
                  <p className="text-xs text-slate-500 mt-1">Head to Skill Pathways or Routines to start logging!</p>
                  <button
                    onClick={() => setActiveTab('roadmap')}
                    className="mt-4 inline-flex items-center gap-2 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-emerald-400 px-4 py-2 rounded-xl border border-slate-700 transition"
                  >
                    View Skill Pathways
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-slate-800/60">
                  {activeWorkout.sets.map((set, index) => (
                    <div key={set.id} className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-800/30 transition">
                      <div className="flex items-center gap-4">
                        <span className="w-7 h-7 rounded-full bg-slate-800 text-slate-400 text-xs font-bold flex items-center justify-center border border-slate-700">
                          #{index + 1}
                        </span>
                        <div>
                          <h4 className="font-bold text-slate-100 text-sm">{set.exerciseName}</h4>
                          <span className="text-xs text-slate-400">Time: {set.timestamp}</span>
                          {set.notes && (
                            <p className="text-xs text-amber-300/90 mt-1 flex items-center gap-1">
                              <MessageSquare className="w-3 h-3" />
                              {set.notes}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="text-center">
                          <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">Reps/Hold</span>
                          <span className="text-sm font-bold text-emerald-400">{set.repsOrHold}</span>
                        </div>

                        <div className="text-center">
                          <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">RPE</span>
                          <span className="text-sm font-bold text-amber-400">{set.rpe}/10</span>
                        </div>

                        <div className="text-center">
                          <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">Form Quality</span>
                          <span className="text-xs font-semibold bg-emerald-500/10 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/20">
                            {set.formRating}
                          </span>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setEditingSet(set)}
                            className="p-2 text-slate-400 hover:text-emerald-400 rounded-lg transition"
                            title="Edit Set"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => removeSet(set.id)}
                            className="p-2 text-slate-500 hover:text-rose-400 rounded-lg transition"
                            title="Delete Set"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  <div className="p-4 bg-slate-950/40">
                    <input
                      type="text"
                      placeholder="Add session notes (e.g. felt great on scapular pulls, wrist slightly tight)..."
                      value={sessionNotes}
                      onChange={(e) => setSessionNotes(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* --- TAB 4: LOG HISTORY --- */}
        {activeTab === 'history' && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-emerald-400" />
                  Training History
                </h2>
                <p className="text-sm text-slate-400 mt-1">Review consistent progression over time.</p>
              </div>

              <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-400 px-3 py-1.5 rounded-xl border border-emerald-500/20 text-xs font-bold">
                <Cloud className="w-4 h-4" />
                <span>Auto-Saved</span>
              </div>
            </div>

            {workoutHistory.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center">
                <BarChart3 className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400 font-medium text-sm">No saved sessions found yet.</p>
                <p className="text-xs text-slate-500 mt-1">Complete your first workout in the "Active Workout" tab to save it here!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {workoutHistory.map((session) => (
                  <div key={session.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div>
                        <h3 className="font-bold text-slate-100">{session.title}</h3>
                        <span className="text-xs text-slate-400">{session.date}</span>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="bg-emerald-500/10 text-emerald-400 text-xs font-bold px-3 py-1 rounded-full border border-emerald-500/20">
                          {session.setsCount} Sets
                        </span>
                        <button
                          onClick={() => deleteHistorySession(session.id)}
                          className="p-1.5 text-slate-500 hover:text-rose-400 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {session.notes && (
                      <p className="text-xs text-slate-400 mt-3 bg-slate-950 p-3 rounded-xl border border-slate-800/80 italic">
                        "{session.notes}"
                      </p>
                    )}

                    {session.sets && (
                      <div className="mt-3 space-y-2">
                        {session.sets.map((s, idx) => (
                          <div key={idx} className="text-xs bg-slate-950 p-2 rounded-lg border border-slate-800/80 flex items-center justify-between">
                            <span className="font-bold text-slate-200">{s.exerciseName}</span>
                            <span className="text-emerald-400 font-bold">{s.repsOrHold} reps</span>
                            <span className="text-amber-400">RPE {s.rpe}</span>
                            <span className="text-slate-400">{s.formRating}</span>
                            {s.notes && <span className="text-amber-300 italic">"{s.notes}"</span>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </main>

      {/* MODAL: AUTHENTICATION */}
      {showAuthModal && (
        <AuthModal onClose={() => setShowAuthModal(false)} />
      )}

      {/* MODAL: ANIMATED FORM DEMO */}
      {selectedExerciseDemo && (
        <ExerciseFormVisualizer 
          exercise={selectedExerciseDemo} 
          onClose={() => setSelectedExerciseDemo(null)} 
        />
      )}

      {/* MODAL: ROUTINE BUILDER */}
      {isBuildingRoutine && (
        <RoutineBuilderModal
          onClose={() => setIsBuildingRoutine(false)}
          onSave={(newRoutine) => saveRoutinesToFirebase([...routines, newRoutine])}
        />
      )}

      {/* MODAL: CUSTOM SET REP LOGGER */}
      {loggingExercise && (
        <LogSetModal
          levelData={loggingExercise.levelData}
          trackId={loggingExercise.trackId}
          restDuration={activeWorkout.restDuration || 90}
          onClose={() => setLoggingExercise(null)}
          onSave={handleSaveSet}
          onStartTimer={startTimer}
        />
      )}

      {/* MODAL: EDIT SET */}
      {editingSet && (
        <LogSetModal
          initialSetData={editingSet}
          trackId={editingSet.trackId}
          restDuration={activeWorkout.restDuration || 90}
          onClose={() => setEditingSet(null)}
          onSave={handleSaveSet}
          onStartTimer={startTimer}
        />
      )}

    </div>
  );
}
