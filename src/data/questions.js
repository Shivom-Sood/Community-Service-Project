// Sample question bank used by the mock API.
// BACKEND TEAM: this will come from Firestore (e.g. a `questions` collection)
// with the same shape: { id, topicId, difficulty (1-3), text, options[], answer (index), explanation }

export const SUBJECTS = [
  { id: 'math', name: 'Mathematics', color: 'blue' },
  { id: 'science', name: 'Science', color: 'emerald' },
]

export const TOPICS = [
  { id: 'algebra', subjectId: 'math', name: 'Algebra' },
  { id: 'geometry', subjectId: 'math', name: 'Geometry' },
  { id: 'fractions', subjectId: 'math', name: 'Fractions & Percentages' },
  { id: 'physics', subjectId: 'science', name: 'Motion & Force' },
  { id: 'chemistry', subjectId: 'science', name: 'Atoms & Molecules' },
  { id: 'biology', subjectId: 'science', name: 'Cells & Life' },
]

export const DIFFICULTY = {
  1: { label: 'Easy', className: 'bg-emerald-50 text-emerald-700 ring-emerald-200' },
  2: { label: 'Medium', className: 'bg-amber-50 text-amber-700 ring-amber-200' },
  3: { label: 'Hard', className: 'bg-rose-50 text-rose-700 ring-rose-200' },
}

const q = (id, topicId, difficulty, text, options, answer, explanation) => ({
  id, topicId, difficulty, text, options, answer, explanation,
})

export const QUESTIONS = [
  // Algebra
  q('alg1', 'algebra', 1, 'Solve: x + 7 = 12', ['5', '19', '7', '12'], 0, 'Subtract 7 from both sides: x = 12 − 7 = 5.'),
  q('alg2', 'algebra', 1, 'What is 3x when x = 4?', ['7', '12', '34', '1'], 1, '3 × 4 = 12.'),
  q('alg3', 'algebra', 1, 'Simplify: 2a + 3a', ['5a', '6a', '5a²', 'a'], 0, 'Like terms add: 2a + 3a = 5a.'),
  q('alg4', 'algebra', 2, 'Solve: 2x − 5 = 11', ['3', '8', '6', '16'], 1, 'Add 5: 2x = 16, divide by 2: x = 8.'),
  q('alg5', 'algebra', 2, 'Expand: 3(x + 4)', ['3x + 4', 'x + 12', '3x + 12', '3x + 7'], 2, 'Multiply each term by 3: 3x + 12.'),
  q('alg6', 'algebra', 2, 'If y = 2x + 1 and x = 3, find y.', ['6', '7', '9', '5'], 1, 'y = 2(3) + 1 = 7.'),
  q('alg7', 'algebra', 3, 'Solve: x² − 5x + 6 = 0', ['x = 1, 6', 'x = 2, 3', 'x = −2, −3', 'x = 5, 6'], 1, 'Factor: (x − 2)(x − 3) = 0, so x = 2 or 3.'),
  q('alg8', 'algebra', 3, 'Solve the system: x + y = 10, x − y = 2', ['x = 6, y = 4', 'x = 4, y = 6', 'x = 5, y = 5', 'x = 8, y = 2'], 0, 'Add equations: 2x = 12, x = 6, then y = 4.'),
  q('alg9', 'algebra', 3, 'Expand: (x + 3)²', ['x² + 9', 'x² + 6x + 9', 'x² + 3x + 9', '2x + 6'], 1, '(a + b)² = a² + 2ab + b² → x² + 6x + 9.'),

  // Geometry
  q('geo1', 'geometry', 1, 'How many sides does a hexagon have?', ['5', '6', '7', '8'], 1, 'Hex means six.'),
  q('geo2', 'geometry', 1, 'The angles of a triangle add up to:', ['90°', '180°', '270°', '360°'], 1, 'Interior angles of any triangle sum to 180°.'),
  q('geo3', 'geometry', 1, 'Perimeter of a square with side 5 cm:', ['10 cm', '20 cm', '25 cm', '15 cm'], 1, '4 × 5 = 20 cm.'),
  q('geo4', 'geometry', 2, 'Area of a rectangle 8 m × 3 m:', ['11 m²', '22 m²', '24 m²', '32 m²'], 2, 'Area = length × width = 24 m².'),
  q('geo5', 'geometry', 2, 'Area of a triangle with base 10 and height 6:', ['60', '30', '16', '36'], 1, '½ × base × height = ½ × 10 × 6 = 30.'),
  q('geo6', 'geometry', 2, 'Two angles of a triangle are 50° and 60°. The third is:', ['70°', '80°', '90°', '110°'], 0, '180 − 50 − 60 = 70°.'),
  q('geo7', 'geometry', 3, 'Hypotenuse of a right triangle with legs 6 and 8:', ['10', '12', '14', '48'], 0, '√(6² + 8²) = √100 = 10.'),
  q('geo8', 'geometry', 3, 'Area of a circle with radius 7 (use π ≈ 22/7):', ['44', '154', '49', '144'], 1, 'πr² = 22/7 × 49 = 154.'),
  q('geo9', 'geometry', 3, 'Each interior angle of a regular pentagon is:', ['72°', '108°', '120°', '90°'], 1, '(5 − 2) × 180 / 5 = 108°.'),

  // Fractions
  q('fra1', 'fractions', 1, 'What is 1/2 + 1/2?', ['1/4', '1', '2/4', '2'], 1, 'Two halves make one whole.'),
  q('fra2', 'fractions', 1, '50% of 80 is:', ['40', '50', '30', '16'], 0, 'Half of 80 = 40.'),
  q('fra3', 'fractions', 1, 'Which fraction equals 0.25?', ['1/2', '1/3', '1/4', '2/5'], 2, '1 ÷ 4 = 0.25.'),
  q('fra4', 'fractions', 2, 'What is 2/3 + 1/6?', ['3/9', '5/6', '1/2', '3/6'], 1, 'LCD 6: 4/6 + 1/6 = 5/6.'),
  q('fra5', 'fractions', 2, '15% of 200 is:', ['15', '20', '30', '45'], 2, '0.15 × 200 = 30.'),
  q('fra6', 'fractions', 2, 'Simplify 18/24', ['3/4', '2/3', '9/12', '6/8'], 0, 'Divide by 6: 3/4.'),
  q('fra7', 'fractions', 3, 'A ₹500 item gets 20% off, then 10% off. Final price?', ['₹350', '₹360', '₹375', '₹400'], 1, '500 × 0.8 = 400, then 400 × 0.9 = 360.'),
  q('fra8', 'fractions', 3, 'What is (3/4) ÷ (3/8)?', ['9/32', '1/2', '2', '3/2'], 2, 'Multiply by reciprocal: 3/4 × 8/3 = 2.'),
  q('fra9', 'fractions', 3, 'A value rises from 40 to 50. Percentage increase?', ['10%', '20%', '25%', '50%'], 2, '(50 − 40) / 40 × 100 = 25%.'),

  // Physics
  q('phy1', 'physics', 1, 'The SI unit of force is:', ['Joule', 'Newton', 'Watt', 'Pascal'], 1, 'Force is measured in newtons (N).'),
  q('phy2', 'physics', 1, 'Speed = ?', ['Distance × Time', 'Distance / Time', 'Time / Distance', 'Mass × Velocity'], 1, 'Speed is distance covered per unit time.'),
  q('phy3', 'physics', 1, 'Which force pulls objects towards Earth?', ['Friction', 'Magnetism', 'Gravity', 'Tension'], 2, 'Gravity attracts masses towards Earth.'),
  q('phy4', 'physics', 2, 'A car travels 120 km in 2 hours. Its speed is:', ['60 km/h', '240 km/h', '122 km/h', '30 km/h'], 0, '120 / 2 = 60 km/h.'),
  q('phy5', 'physics', 2, 'Force needed to accelerate 5 kg at 2 m/s²:', ['2.5 N', '7 N', '10 N', '3 N'], 2, 'F = ma = 5 × 2 = 10 N.'),
  q('phy6', 'physics', 2, 'Newton\'s third law states that:', ['F = ma', 'Every action has an equal and opposite reaction', 'Objects stay at rest', 'Energy is conserved'], 1, 'Forces come in action–reaction pairs.'),
  q('phy7', 'physics', 3, 'A ball starts at rest and accelerates at 3 m/s² for 4 s. Final velocity?', ['7 m/s', '12 m/s', '0.75 m/s', '24 m/s'], 1, 'v = u + at = 0 + 3 × 4 = 12 m/s.'),
  q('phy8', 'physics', 3, 'Momentum of a 2 kg ball moving at 6 m/s:', ['3 kg·m/s', '8 kg·m/s', '12 kg·m/s', '36 kg·m/s'], 2, 'p = mv = 2 × 6 = 12 kg·m/s.'),
  q('phy9', 'physics', 3, 'Distance covered from rest at 2 m/s² in 5 s:', ['10 m', '25 m', '50 m', '20 m'], 1, 's = ½at² = ½ × 2 × 25 = 25 m.'),

  // Chemistry
  q('che1', 'chemistry', 1, 'The chemical symbol for water is:', ['O₂', 'H₂O', 'CO₂', 'HO'], 1, 'Two hydrogen atoms and one oxygen atom.'),
  q('che2', 'chemistry', 1, 'Which particle has a negative charge?', ['Proton', 'Neutron', 'Electron', 'Nucleus'], 2, 'Electrons carry negative charge.'),
  q('che3', 'chemistry', 1, 'The symbol "Na" stands for:', ['Nitrogen', 'Sodium', 'Neon', 'Nickel'], 1, 'Na comes from the Latin "natrium" (sodium).'),
  q('che4', 'chemistry', 2, 'Atomic number tells us the number of:', ['Neutrons', 'Protons', 'Molecules', 'Shells'], 1, 'Atomic number = number of protons.'),
  q('che5', 'chemistry', 2, 'Which of these is a compound?', ['Oxygen', 'Iron', 'Carbon dioxide', 'Helium'], 2, 'CO₂ contains two different elements chemically bonded.'),
  q('che6', 'chemistry', 2, 'pH of a neutral solution is:', ['0', '7', '10', '14'], 1, 'Pure water at 25°C has pH 7.'),
  q('che7', 'chemistry', 3, 'Molar mass of CO₂ (C = 12, O = 16):', ['28 g/mol', '44 g/mol', '32 g/mol', '40 g/mol'], 1, '12 + 2 × 16 = 44 g/mol.'),
  q('che8', 'chemistry', 3, 'Electronic configuration of sodium (11):', ['2, 8, 1', '2, 9', '2, 8, 2', '8, 2, 1'], 0, 'Shells fill as 2, 8, then 1.'),
  q('che9', 'chemistry', 3, 'Balance: H₂ + O₂ → H₂O. Coefficient of H₂O is:', ['1', '2', '3', '4'], 1, '2H₂ + O₂ → 2H₂O.'),

  // Biology
  q('bio1', 'biology', 1, 'The basic unit of life is the:', ['Atom', 'Cell', 'Organ', 'Tissue'], 1, 'All living things are made of cells.'),
  q('bio2', 'biology', 1, 'Which organelle is called the powerhouse of the cell?', ['Nucleus', 'Ribosome', 'Mitochondria', 'Vacuole'], 2, 'Mitochondria produce energy (ATP).'),
  q('bio3', 'biology', 1, 'Plants make food by:', ['Respiration', 'Photosynthesis', 'Digestion', 'Transpiration'], 1, 'Photosynthesis uses light to make glucose.'),
  q('bio4', 'biology', 2, 'Which structure is found in plant cells but not animal cells?', ['Cell membrane', 'Nucleus', 'Cell wall', 'Mitochondria'], 2, 'Plant cells have a rigid cellulose cell wall.'),
  q('bio5', 'biology', 2, 'DNA is mostly found in the:', ['Cytoplasm', 'Nucleus', 'Cell wall', 'Vacuole'], 1, 'The nucleus stores most of the cell\'s DNA.'),
  q('bio6', 'biology', 2, 'Green pigment that absorbs light in plants:', ['Haemoglobin', 'Chlorophyll', 'Keratin', 'Melanin'], 1, 'Chlorophyll in chloroplasts absorbs light.'),
  q('bio7', 'biology', 3, 'Cell division producing gametes is called:', ['Mitosis', 'Meiosis', 'Osmosis', 'Fission'], 1, 'Meiosis halves the chromosome number to make gametes.'),
  q('bio8', 'biology', 3, 'Movement of water across a semi-permeable membrane is:', ['Diffusion', 'Osmosis', 'Active transport', 'Endocytosis'], 1, 'Osmosis is water movement across a membrane.'),
  q('bio9', 'biology', 3, 'Which organelle synthesises proteins?', ['Lysosome', 'Golgi body', 'Ribosome', 'Centriole'], 2, 'Ribosomes translate mRNA into proteins.'),
]
