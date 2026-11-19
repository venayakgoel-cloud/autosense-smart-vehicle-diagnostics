import type { ObdCategory, ObdCodeEntry, SeverityLevel, TransitEligibility } from '../types/autosense';

export const SEVERITY_GUIDANCE: Record<
  SeverityLevel,
  { label: string; actionSummary: string; badgeClass: string; textClass: string }
> = {
  Critical: {
    label: 'Critical',
    actionSummary: 'Stop safely and seek professional assistance.',
    badgeClass: 'border-red-500/40 bg-red-500/10 text-red-300',
    textClass: 'text-red-400',
  },
  High: {
    label: 'High',
    actionSummary: 'Arrange professional inspection promptly.',
    badgeClass: 'border-orange-500/40 bg-orange-500/10 text-orange-300',
    textClass: 'text-orange-400',
  },
  Medium: {
    label: 'Medium',
    actionSummary: 'Get the issue checked soon.',
    badgeClass: 'border-amber-500/40 bg-amber-500/10 text-amber-300',
    textClass: 'text-amber-300',
  },
  Low: {
    label: 'Low',
    actionSummary: 'Monitor or schedule routine maintenance.',
    badgeClass: 'border-blue-500/40 bg-blue-500/10 text-blue-300',
    textClass: 'text-blue-400',
  },
};

export const TRANSIT_GUIDANCE: Record<
  TransitEligibility,
  { label: string; summary: string; badgeClass: string }
> = {
  Clearable: {
    label: 'Driveable · Latching Flag',
    summary:
      'Usually does not block starting. You can drive carefully to a service centre; Mode $04 reset only clears the stored warning indicator if the fault is not currently active.',
    badgeClass: 'border-blue-500/30 bg-blue-500/10 text-blue-300',
  },
  EcuLimpHome: {
    label: 'ECU Limp-Home Fallback',
    summary:
      'Your vehicle ECU may substitute default sensor maps or limit power/gears so you can travel slowly to a nearby workshop. Avoid highways and heavy throttle.',
    badgeClass: 'border-amber-500/40 bg-amber-500/10 text-amber-300',
  },
  HardwareLockout: {
    label: 'Safety Lockout · Cannot Bypass',
    summary:
      'This fault affects a mandatory starting, timing, immobilizer, or safety-critical system. OBD-II scanners cannot and must not bypass it—arrange towing to a service centre.',
    badgeClass: 'border-red-500/40 bg-red-500/10 text-red-300',
  },
};

export const VEHICLE_BRANDS: string[] = [
  'All Brands',
  'Universal (SAE / ISO)',
  'Toyota / Lexus',
  'Honda / Acura',
  'Ford / Lincoln',
  'GM / Chevrolet',
  'Volkswagen / Audi',
  'BMW / MINI',
  'Mercedes-Benz',
  'Hyundai / Kia',
  'Nissan / Infiniti',
  'Stellantis / Jeep',
  'Subaru / Mazda',
  'Tata / Mahindra / Suzuki',
  'EV & Hybrid',
];

export const STANDARD_OBD_CODES: ObdCodeEntry[] = [
  // ================= UNIVERSAL SAE J2012 POWERTRAIN (P0xxx / P2xxx) =================
  {
    code: 'P0011',
    name: 'Camshaft Position "A" Timing Over-Advanced (Bank 1)',
    brand: 'Universal (SAE / ISO)',
    category: 'Engine',
    severity: 'Medium',
    transitEligibility: 'EcuLimpHome',
    transitNote: 'ECU disables variable valve timing advance to protect valvetrain during transit.',
    meaning:
      'The intake camshaft on Bank 1 is rotating slightly ahead of the target timing commanded by the engine computer.',
    possibleCauses: [
      'Low or overdue engine oil affecting hydraulic VVT actuator pressure',
      'Sticking variable valve timing (VVT) oil control solenoid',
      'Stretched timing chain or worn tensioner',
    ],
    nextSteps: 'Check engine oil level when parked and cold, then drive gently to a workshop.',
    mechanicAdvice: 'Yes — prompt oil pressure and VVT solenoid inspection is advised.',
  },
  {
    code: 'P0016',
    name: 'Crankshaft / Camshaft Position Correlation (Bank 1 Sensor A)',
    brand: 'Universal (SAE / ISO)',
    category: 'Sensors',
    severity: 'High',
    transitEligibility: 'HardwareLockout',
    transitNote: 'Mechanical timing correlation faults risk piston-to-valve contact if driven hard.',
    meaning:
      'The crankshaft and camshaft rotation signals are out of sync relative to each other.',
    possibleCauses: [
      'Worn or jumped timing chain / belt',
      'Failing camshaft or crankshaft position sensor',
      'Low oil pressure affecting cam phaser lock pin',
    ],
    nextSteps: 'Avoid restarting repeatedly if cranking sounds irregular; arrange workshop inspection.',
    mechanicAdvice: 'Yes — have timing alignment verified before continued driving.',
  },
  {
    code: 'P0087',
    name: 'Fuel Rail / System Pressure Too Low',
    brand: 'Universal (SAE / ISO)',
    category: 'Fuel & Air',
    severity: 'Critical',
    transitEligibility: 'HardwareLockout',
    transitNote: 'Insufficient fuel pressure prevents safe combustion and cannot be bypassed via OBD-II.',
    meaning:
      'Fuel pressure inside the high-pressure rail fell below the minimum required for the engine to run reliably.',
    possibleCauses: [
      'Weak in-tank lift pump or high-pressure fuel pump',
      'Severely clogged fuel filter',
      'Faulty fuel rail pressure regulator or sensor',
    ],
    nextSteps: 'If the engine stalls or refuses to start, pull over safely and arrange towing.',
    mechanicAdvice: 'Yes — fuel pressure testing requires specialized workshop gauges.',
  },
  {
    code: 'P0101',
    name: 'Mass Air Flow (MAF) Sensor Circuit Range/Performance',
    brand: 'Universal (SAE / ISO)',
    category: 'Fuel & Air',
    severity: 'Medium',
    transitEligibility: 'EcuLimpHome',
    transitNote: 'Most ECUs switch to Speed-Density fallback calculation so you can reach a workshop.',
    meaning:
      'The airflow measured entering the engine does not match what the computer expects for your throttle and engine speed.',
    possibleCauses: [
      'Clogged or improperly seated engine air filter',
      'Contaminated MAF sensor element',
      'Unmetered air leak between the sensor and throttle body',
    ],
    nextSteps:
      'Drive gently to a service centre; the ECU typically uses backup airflow estimates to keep moving.',
    mechanicAdvice: 'Yes — have a technician inspect the air intake ducts and live airflow readings.',
  },
  {
    code: 'P0113',
    name: 'Intake Air Temperature (IAT) Sensor 1 Circuit High',
    brand: 'Universal (SAE / ISO)',
    category: 'Sensors',
    severity: 'Low',
    transitEligibility: 'EcuLimpHome',
    transitNote: 'ECU substitutes a fixed 20 °C fallback air temperature so the car remains driveable.',
    meaning:
      'The intake air temperature sensor is reporting an open circuit or extreme cold reading.',
    possibleCauses: [
      'Unplugged intake temperature connector after air filter service',
      'Damaged wiring harness near the airbox',
      'Failed IAT thermistor',
    ],
    nextSteps: 'Vehicle remains driveable to a service centre; fuel economy may dip slightly.',
    mechanicAdvice: 'Yes — routine electrical check of the intake sensor connector.',
  },
  {
    code: 'P0118',
    name: 'Engine Coolant Temperature Sensor Circuit High',
    brand: 'Universal (SAE / ISO)',
    category: 'Sensors',
    severity: 'Critical',
    transitEligibility: 'HardwareLockout',
    transitNote: 'Inaccurate coolant data risks severe overheating and cannot be safely bypassed.',
    meaning:
      'The computer is receiving an abnormally high voltage signal from the coolant temperature sensor, risking inaccurate cooling fan control.',
    possibleCauses: [
      'Damaged or disconnected coolant temperature sensor wiring',
      'Failed coolant temperature sensor',
      'Severe coolant loss or air pocket in cooling system',
    ],
    nextSteps:
      'Stop safely if steam appears or the temperature gauge rises into red. Never open a hot radiator cap.',
    mechanicAdvice: 'Yes — immediate professional inspection or roadside assistance is advised.',
  },
  {
    code: 'P0128',
    name: 'Coolant Thermostat Below Regulating Temperature',
    brand: 'Universal (SAE / ISO)',
    category: 'Engine',
    severity: 'Low',
    transitEligibility: 'Clearable',
    meaning:
      'The engine coolant is taking longer than normal to reach its ideal operating temperature.',
    possibleCauses: [
      'Thermostat valve stuck partially open',
      'Inaccurate engine coolant temperature sensor',
      'Low coolant level (inspect only when completely cold)',
    ],
    nextSteps: 'Safe to drive carefully to a workshop while watching your temperature gauge.',
    mechanicAdvice: 'Yes — a mechanic can verify actual coolant temperature and thermostat operation.',
  },
  {
    code: 'P0135',
    name: 'O2 Sensor Heater Circuit Malfunction (Bank 1 Sensor 1)',
    brand: 'Universal (SAE / ISO)',
    category: 'Emissions',
    severity: 'Low',
    transitEligibility: 'Clearable',
    meaning:
      'The pre-heater element inside the primary exhaust oxygen sensor is not warming up as expected.',
    possibleCauses: [
      'Burned-out oxygen sensor heater element',
      'Blown O2 heater fuse or open wiring',
    ],
    nextSteps: 'Car starts and drives normally; schedule a service visit soon.',
    mechanicAdvice: 'Yes — check heater circuit resistance and fuse integrity.',
  },
  {
    code: 'P0171',
    name: 'System Too Lean (Bank 1)',
    brand: 'Universal (SAE / ISO)',
    category: 'Fuel & Air',
    severity: 'Medium',
    transitEligibility: 'EcuLimpHome',
    transitNote: 'ECU enriches fuel trim automatically within safe limits to keep the engine running.',
    meaning:
      'The engine is receiving more air or less fuel than expected on Bank 1.',
    possibleCauses: [
      'Small air leak in an intake hose or vacuum line',
      'Dirty Mass Air Flow (MAF) sensor',
      'Weakening fuel delivery or aging oxygen sensor',
    ],
    nextSteps: 'Drive carefully at steady speeds to a nearby workshop; avoid heavy engine loads.',
    mechanicAdvice: 'Yes — have a technician perform a smoke leak test and live fuel-trim check.',
  },
  {
    code: 'P0172',
    name: 'System Too Rich (Bank 1)',
    brand: 'Universal (SAE / ISO)',
    category: 'Fuel & Air',
    severity: 'Medium',
    transitEligibility: 'EcuLimpHome',
    meaning: 'Too much fuel or too little air is entering the combustion mixture on Bank 1.',
    possibleCauses: [
      'Leaking fuel injector or high fuel pressure',
      'Severely restricted engine air filter',
      'Faulty purge valve stuck open',
    ],
    nextSteps: 'Drive calmly to a service centre; extended rich running can foul spark plugs.',
    mechanicAdvice: 'Yes — inspect fuel trims, EVAP purge valve, and injector balance.',
  },
  {
    code: 'P0217',
    name: 'Engine Coolant Over Temperature Condition',
    brand: 'Universal (SAE / ISO)',
    category: 'Engine',
    severity: 'Critical',
    transitEligibility: 'HardwareLockout',
    transitNote: 'Driving an overheated engine causes head gasket and block damage; towing required.',
    meaning: 'Engine coolant temperature exceeded safe thermal limits.',
    possibleCauses: [
      'Coolant leak or failed water pump',
      'Radiator cooling fan failure',
      'Stuck closed thermostat',
    ],
    nextSteps: 'Pull over safely immediately and switch off the engine. Do NOT open the coolant cap.',
    mechanicAdvice: 'Yes — arrange towing to a service centre.',
  },
  {
    code: 'P0300',
    name: 'Random or Multiple Cylinder Misfire Detected',
    brand: 'Universal (SAE / ISO)',
    category: 'Ignition',
    severity: 'High',
    transitEligibility: 'EcuLimpHome',
    transitNote:
      'If Check Engine Light is steady, drive slowly to a nearby workshop; if flashing, pull over immediately.',
    meaning:
      'Your engine control computer detected incomplete combustion across multiple cylinders.',
    possibleCauses: [
      'Worn spark plugs or ignition coils',
      'Fuel delivery irregularity or vacuum leak',
      'Compression or timing anomaly',
    ],
    nextSteps:
      'Avoid hard acceleration. If the Check Engine Light flashes, pull over safely and turn off the engine.',
    mechanicAdvice: 'Yes — prompt ignition, fuel pressure, and compression testing is required.',
  },
  {
    code: 'P0301',
    name: 'Cylinder 1 Misfire Detected',
    brand: 'Universal (SAE / ISO)',
    category: 'Ignition',
    severity: 'High',
    transitEligibility: 'EcuLimpHome',
    meaning: 'Cylinder 1 is not firing consistently during combustion cycles.',
    possibleCauses: [
      'Worn Cylinder 1 spark plug or ignition coil',
      'Clogged Cylinder 1 fuel injector',
      'Low cylinder compression',
    ],
    nextSteps: 'Drive gently at low load to a service centre unless warning light flashes.',
    mechanicAdvice: 'Yes — technician should swap/test coil, spark plug, and injector.',
  },
  {
    code: 'P0325',
    name: 'Knock Sensor 1 Circuit Malfunction',
    brand: 'Universal (SAE / ISO)',
    category: 'Sensors',
    severity: 'Medium',
    transitEligibility: 'EcuLimpHome',
    transitNote: 'ECU retards ignition timing conservatively to prevent engine knock during transit.',
    meaning: 'The engine computer lost the vibration feedback signal from the knock sensor.',
    possibleCauses: ['Failed knock sensor', 'Rodent-damaged or heat-brittled harness wiring'],
    nextSteps: 'Drive gently using standard fuel; avoid steep hills until inspected.',
    mechanicAdvice: 'Yes — verify sensor resistance and wiring continuity.',
  },
  {
    code: 'P0335',
    name: 'Crankshaft Position Sensor A Circuit Malfunction',
    brand: 'Universal (SAE / ISO)',
    category: 'Sensors',
    severity: 'Critical',
    transitEligibility: 'HardwareLockout',
    transitNote:
      'Without a valid crankshaft timing pulse, the ECU cannot synchronize spark or fuel injection; OBD-II cannot bypass this sensor.',
    meaning:
      'The engine computer lost the primary rotation timing signal from the crankshaft sensor, causing stalling or no-start.',
    possibleCauses: [
      'Failing crankshaft position sensor',
      'Damaged wiring harness near the lower engine block',
      'Reluctor ring debris or timing signal interference',
    ],
    nextSteps: 'Do not attempt repeated cranking in traffic; arrange safe towing to a workshop.',
    mechanicAdvice: 'Yes — oscilloscope and factory-grade timing diagnostics required.',
  },
  {
    code: 'P0340',
    name: 'Camshaft Position Sensor "A" Circuit Malfunction',
    brand: 'Universal (SAE / ISO)',
    category: 'Sensors',
    severity: 'High',
    transitEligibility: 'HardwareLockout',
    transitNote:
      'Many modern engines inhibit starting or fuel injection sync when camshaft position is missing; cannot be bypassed via OBD-II.',
    meaning:
      'The ECU is not receiving a clean phase signal from the Bank 1 camshaft position sensor.',
    possibleCauses: [
      'Failed camshaft position sensor',
      'Open/shorted sensor wiring',
      'Timing belt/chain misalignment',
    ],
    nextSteps: 'If the car fails to start or stalls, request roadside towing to a service centre.',
    mechanicAdvice: 'Yes — test cam sensor power, ground, and signal waveform.',
  },
  {
    code: 'P0401',
    name: 'Exhaust Gas Recirculation (EGR) Flow Insufficient',
    brand: 'Universal (SAE / ISO)',
    category: 'Emissions',
    severity: 'Medium',
    transitEligibility: 'Clearable',
    meaning: 'Less exhaust gas than expected is recirculating through the EGR valve.',
    possibleCauses: ['Carbon buildup in EGR passages', 'Sticking EGR valve or sensor'],
    nextSteps: 'Drive normally to a service centre for routine intake/EGR cleaning.',
    mechanicAdvice: 'Yes — command-test EGR valve and inspect passages.',
  },
  {
    code: 'P0420',
    name: 'Catalyst System Efficiency Below Threshold (Bank 1)',
    brand: 'Universal (SAE / ISO)',
    category: 'Emissions',
    severity: 'Low',
    transitEligibility: 'Clearable',
    meaning:
      'Exhaust sensors indicate reduced catalytic converter efficiency; does not block vehicle starting.',
    possibleCauses: ['Aging catalytic converter', 'Faulty downstream oxygen sensor', 'Exhaust leak'],
    nextSteps: 'Safe for local driving; schedule an emissions & O2 sensor check.',
    mechanicAdvice: 'Recommended — test oxygen sensors before replacing the converter.',
  },
  {
    code: 'P0442',
    name: 'Evaporative Emission System Small Leak Detected',
    brand: 'Universal (SAE / ISO)',
    category: 'Emissions',
    severity: 'Low',
    transitEligibility: 'Clearable',
    meaning: 'A minor fuel vapor leak was detected in the sealed fuel tank evaporative system.',
    possibleCauses: ['Loosely sealed fuel cap', 'Hairline crack in an EVAP vapor line'],
    nextSteps: 'Tighten your fuel cap until it clicks; safe to drive.',
    mechanicAdvice: 'If persistent, schedule a routine EVAP smoke test.',
  },
  {
    code: 'P0455',
    name: 'Evaporative Emission System Large Leak Detected',
    brand: 'Universal (SAE / ISO)',
    category: 'Emissions',
    severity: 'Low',
    transitEligibility: 'Clearable',
    meaning: 'Fuel vapors are escaping from the fuel tank evaporative recovery circuit.',
    possibleCauses: ['Fuel cap left loose or worn seal', 'Disconnected EVAP hose', 'Stuck purge valve'],
    nextSteps: 'Check and tighten the fuel filler cap firmly; safe to drive to a workshop.',
    mechanicAdvice: 'If warning returns after tightening the cap, request an EVAP smoke check.',
  },
  {
    code: 'P0500',
    name: 'Vehicle Speed Sensor (VSS) Malfunction',
    brand: 'Universal (SAE / ISO)',
    category: 'Sensors',
    severity: 'Medium',
    transitEligibility: 'EcuLimpHome',
    meaning: 'The powertrain computer is not receiving consistent wheel/vehicle speed pulses.',
    possibleCauses: ['Failed ABS/wheel speed sensor', 'Damaged speed sensor wiring'],
    nextSteps: 'Speedometer or cruise control may not work; drive cautiously to a workshop.',
    mechanicAdvice: 'Yes — scan ABS wheel speed channels to isolate the faulty wheel sensor.',
  },
  {
    code: 'P0562',
    name: 'System Voltage Low',
    brand: 'Universal (SAE / ISO)',
    category: 'Electrical',
    severity: 'High',
    transitEligibility: 'EcuLimpHome',
    transitNote:
      'If engine is running, turn off A/C, heated seats, and audio and drive directly to a service centre—it may not restart once turned off.',
    meaning: 'Battery/alternator electrical voltage dropped below minimum operating thresholds.',
    possibleCauses: ['Weak 12V battery', 'Failing alternator', 'Corroded battery terminals'],
    nextSteps: 'Reduce electrical load and proceed straight to a service centre without shutting off.',
    mechanicAdvice: 'Yes — perform battery load test and alternator output test.',
  },
  {
    code: 'P0606',
    name: 'ECM / PCM Processor Fault',
    brand: 'Universal (SAE / ISO)',
    category: 'Electrical',
    severity: 'Critical',
    transitEligibility: 'HardwareLockout',
    meaning: 'Internal self-check failure inside the main Engine Control Module.',
    possibleCauses: ['Unstable battery voltage/ground', 'Water intrusion or failed ECM hardware'],
    nextSteps: 'Stop safely; vehicle may enter complete shutdown or fail to crank.',
    mechanicAdvice: 'Yes — inspect ECM power/ground feeds before module replacement.',
  },
  {
    code: 'P0700',
    name: 'Transmission Control System Malfunction',
    brand: 'Universal (SAE / ISO)',
    category: 'Transmission',
    severity: 'High',
    transitEligibility: 'EcuLimpHome',
    transitNote: 'Transmission typically locks into a single safe limp gear (e.g. 2nd or 3rd) for workshop transit.',
    meaning: 'The Transmission Control Module (TCM) flagged an internal shift or pressure fault.',
    possibleCauses: ['Low transmission fluid', 'Failed shift solenoid or speed sensor'],
    nextSteps: 'Drive gently on local roads to a transmission specialist.',
    mechanicAdvice: 'Yes — read TCM-specific sub-codes with a full-system diagnostic scanner.',
  },
  {
    code: 'P2002',
    name: 'Diesel Particulate Filter (DPF) Efficiency Below Threshold',
    brand: 'Universal (SAE / ISO)',
    category: 'Emissions',
    severity: 'Medium',
    transitEligibility: 'EcuLimpHome',
    meaning: 'Soot loading or differential pressure across the diesel particulate filter is out of spec.',
    possibleCauses: ['Short urban trips preventing DPF regeneration', 'Failed DPF pressure sensor'],
    nextSteps: 'Avoid ignoring DPF warnings; prolonged driving can force reduced-power limp mode.',
    mechanicAdvice: 'Yes — technician can verify soot mass and perform forced regeneration safely.',
  },
  {
    code: 'P2135',
    name: 'Throttle/Pedal Position Sensor/Switch A/B Voltage Correlation',
    brand: 'Universal (SAE / ISO)',
    category: 'Sensors',
    severity: 'High',
    transitEligibility: 'EcuLimpHome',
    transitNote: 'ECU limits throttle opening to idle/crawling speed for safety.',
    meaning: 'The twin safety potentiometers on the throttle body or pedal disagree.',
    possibleCauses: ['Dirty/failing electronic throttle body', 'Corroded throttle connector'],
    nextSteps: 'Expect very limited acceleration; pull off main roads and visit a nearby workshop.',
    mechanicAdvice: 'Yes — live dual-track TPS voltage correlation testing needed.',
  },

  // ================= EV & HYBRID SYSTEMS =================
  {
    code: 'P0A0F',
    name: 'Hybrid Engine Failed to Start',
    brand: 'EV & Hybrid',
    category: 'Engine',
    severity: 'Critical',
    transitEligibility: 'HardwareLockout',
    meaning: 'The hybrid controller commanded the petrol engine to crank via MG1, but it failed to fire.',
    possibleCauses: ['Out of fuel', 'Crank/fuel fault', '12V auxiliary battery depleted'],
    nextSteps: 'Do not keep driving on HV battery alone until depleted; arrange service support.',
    mechanicAdvice: 'Yes — hybrid specialist inspection required.',
  },
  {
    code: 'P0A80',
    name: 'Replace Hybrid / High-Voltage Battery Pack',
    brand: 'EV & Hybrid',
    category: 'Electrical',
    severity: 'High',
    transitEligibility: 'EcuLimpHome',
    meaning: 'Voltage imbalance across hybrid battery cell blocks exceeded manufacturer tolerances.',
    possibleCauses: ['Aged hybrid battery modules', 'Blocked battery cooling fan/duct'],
    nextSteps: 'Vehicle usually remains driveable in reduced-power mode; visit a hybrid workshop.',
    mechanicAdvice: 'Yes — never open high-voltage orange cabling; seek certified hybrid service.',
  },
  {
    code: 'P0AA6',
    name: 'Hybrid / EV Battery Voltage System Isolation Fault',
    brand: 'EV & Hybrid',
    category: 'Electrical',
    severity: 'Critical',
    transitEligibility: 'HardwareLockout',
    transitNote: 'High-voltage isolation faults lock out HV contactors on restart for occupant safety.',
    meaning: 'Electrical leakage was detected between the high-voltage pack and vehicle chassis.',
    possibleCauses: ['Moisture in HV inverter/compressor', 'Damaged orange HV cable insulation'],
    nextSteps: 'Park safely and request certified EV/Hybrid flatbed recovery.',
    mechanicAdvice: 'Yes — high-voltage insulation megaohm testing by certified EV technician only.',
  },

  // ================= CHASSIS, BODY & NETWORK (C / B / U) =================
  {
    code: 'C0035',
    name: 'Left Front Wheel Speed Sensor Circuit',
    brand: 'Universal (SAE / ISO)',
    category: 'Sensors',
    severity: 'High',
    transitEligibility: 'EcuLimpHome',
    meaning: 'ABS/ESC cannot read rotation speed from the front-left wheel hub.',
    possibleCauses: ['Damaged ABS wheel sensor', 'Broken tone ring or wire near hub'],
    nextSteps: 'ABS and traction control may be disabled; drive cautiously with extra braking distance.',
    mechanicAdvice: 'Yes — inspect wheel speed sensor and hub wiring promptly.',
  },
  {
    code: 'B0001',
    name: 'Driver Frontal Stage 1 Airbag Deployment Control',
    brand: 'Universal (SAE / ISO)',
    category: 'Electrical',
    severity: 'High',
    transitEligibility: 'Clearable',
    meaning: 'SRS airbag computer detected abnormal resistance in the driver steering-wheel airbag circuit.',
    possibleCauses: ['Worn steering clock-spring', 'Loose seat/column yellow SRS connector'],
    nextSteps: 'Car drives normally, but airbags may not deploy in a collision—service promptly.',
    mechanicAdvice: 'Yes — SRS circuits must only be diagnosed by trained technicians.',
  },
  {
    code: 'U0100',
    name: 'Lost Communication With Engine Control Module (ECM)',
    brand: 'Universal (SAE / ISO)',
    category: 'Electrical',
    severity: 'Critical',
    transitEligibility: 'HardwareLockout',
    transitNote: 'CAN bus loss prevents coordinated engine start/operation and cannot be bypassed via OBD-II.',
    meaning: 'Other modules could not exchange data with the primary engine computer.',
    possibleCauses: ['Blown ECM power relay/fuse', 'Weak battery', 'CAN bus wiring open/short'],
    nextSteps: 'Park safely and arrange electrical diagnostics/towing.',
    mechanicAdvice: 'Yes — CAN bus resistance and power-feed testing required.',
  },
  {
    code: 'U0101',
    name: 'Lost Communication With Transmission Control Module (TCM)',
    brand: 'Universal (SAE / ISO)',
    category: 'Transmission',
    severity: 'Critical',
    transitEligibility: 'HardwareLockout',
    meaning: 'Engine/ABS modules lost CAN communication with the automatic transmission controller.',
    possibleCauses: ['Blown TCM fuse', 'Corroded transmission harness connector'],
    nextSteps: 'Transmission may refuse to shift out of Park or stay in 2nd gear; arrange service.',
    mechanicAdvice: 'Yes — inspect TCM power/ground and CAN bus lines.',
  },

  // ================= MANUFACTURER-SPECIFIC OEM CODES =================
  // TOYOTA / LEXUS
  {
    code: 'P1604',
    name: 'Toyota / Lexus Startability Malfunction',
    brand: 'Toyota / Lexus',
    category: 'Engine',
    severity: 'High',
    transitEligibility: 'HardwareLockout',
    meaning: 'Engine failed to crank cleanly or took abnormally long to start on recent ignition cycles.',
    possibleCauses: ['Weak 12V battery', 'Fuel delivery delay', 'Mass airflow or crank signal dip'],
    nextSteps: 'If vehicle starts cleanly now, drive straight to a workshop; if not, request tow.',
    mechanicAdvice: 'Yes — review freeze-frame start attempt counters with Toyota Techstream/scanner.',
  },
  {
    code: 'C1201',
    name: 'Toyota / Lexus Engine Control System Malfunction (VSC/ABS Disabled)',
    brand: 'Toyota / Lexus',
    category: 'Sensors',
    severity: 'Medium',
    transitEligibility: 'EcuLimpHome',
    meaning: 'Toyota VSC/ABS unit automatically turned off stability assist because a separate engine code is active.',
    possibleCauses: ['Companion P-code stored in the ECM (such as P0171 or P0420)'],
    nextSteps: 'Fix the primary P-code first; C1201 normally clears once the engine fault is repaired.',
    mechanicAdvice: 'Yes — read companion ECM codes alongside ABS history.',
  },
  {
    code: 'B2799',
    name: 'Toyota / Lexus Engine Immobiliser System Malfunction',
    brand: 'Toyota / Lexus',
    category: 'Electrical',
    severity: 'Critical',
    transitEligibility: 'HardwareLockout',
    transitNote: 'Anti-theft immobilizer cutoffs are hardware-enforced and cannot be bypassed by diagnostic apps.',
    meaning: 'Immobilizer verification between key transponder and ECM failed.',
    possibleCauses: ['Unrecognized key chip', 'Weak key fob battery', 'Immobilizer antenna ring fault'],
    nextSteps: 'Try your spare factory key; if engine still cranks and stalls after 2 seconds, tow to dealer.',
    mechanicAdvice: 'Yes — certified locksmith or dealer key synchronization needed.',
  },

  // HONDA / ACURA
  {
    code: 'P1259',
    name: 'Honda / Acura VTEC System Malfunction (Bank 1)',
    brand: 'Honda / Acura',
    category: 'Engine',
    severity: 'High',
    transitEligibility: 'EcuLimpHome',
    transitNote: 'Honda ECU caps engine RPM around 3,000 RPM to prevent valvetrain stress during transit.',
    meaning: 'VTEC variable valve lift pressure switch did not confirm oil pressure engagement.',
    possibleCauses: ['Low engine oil level', 'Clogged VTEC spool valve screen', 'Faulty VTEC oil pressure switch'],
    nextSteps: 'Check oil dipstick safely while engine is off and cool; drive below 3,000 RPM to workshop.',
    mechanicAdvice: 'Yes — inspect VTEC solenoid screen and oil pressure.',
  },
  {
    code: 'P1456',
    name: 'Honda / Acura EVAP Control System Leakage (Fuel Tank System)',
    brand: 'Honda / Acura',
    category: 'Emissions',
    severity: 'Low',
    transitEligibility: 'Clearable',
    meaning: 'Vapor pressure leak detected specifically on the fuel-tank side of the EVAP system.',
    possibleCauses: ['Loose Honda fuel cap', 'Worn fuel tank pressure sensor O-ring'],
    nextSteps: 'Tighten fuel cap 3 clicks; safe to drive normally.',
    mechanicAdvice: 'Routine inspection if code returns after tightening fuel cap.',
  },

  // FORD / LINCOLN
  {
    code: 'P1260',
    name: 'Ford / Lincoln Theft Detected — Vehicle Immobilized',
    brand: 'Ford / Lincoln',
    category: 'Electrical',
    severity: 'Critical',
    transitEligibility: 'HardwareLockout',
    transitNote: 'PATS anti-theft fuel/starter cut cannot be bypassed via OBD-II.',
    meaning: 'Ford Passive Anti-Theft System (PATS) blocked engine start because key ID did not match.',
    possibleCauses: ['Damaged transponder key', 'Transceiver halo failure around ignition', 'Low vehicle battery'],
    nextSteps: 'Try your spare programmed Ford key; otherwise arrange locksmith or Ford dealer service.',
    mechanicAdvice: 'Yes — PATS key programming or transceiver replacement required.',
  },
  {
    code: 'P1450',
    name: 'Ford / Lincoln Unable to Bleed Up Fuel Tank Vacuum',
    brand: 'Ford / Lincoln',
    category: 'Emissions',
    severity: 'Medium',
    transitEligibility: 'Clearable',
    meaning: 'Excessive vacuum built up inside the fuel tank during EVAP purge.',
    possibleCauses: ['Stuck-open EVAP canister purge valve', 'Blocked EVAP vent hose/charcoal canister'],
    nextSteps: 'Drive carefully to a workshop; car may hesitate slightly right after refueling.',
    mechanicAdvice: 'Yes — replace/test purge solenoid and clear vent line.',
  },
  {
    code: 'B1600',
    name: 'Ford PATS Ignition Key Transponder Signal Not Received',
    brand: 'Ford / Lincoln',
    category: 'Electrical',
    severity: 'Critical',
    transitEligibility: 'HardwareLockout',
    meaning: 'Ignition lock cylinder transceiver failed to read any chip inside the inserted key.',
    possibleCauses: ['Non-chipped spare key used', 'Failed PATS transceiver coil'],
    nextSteps: 'Use original chipped key or contact certified automotive locksmith.',
    mechanicAdvice: 'Yes — PATS transceiver diagnostic check needed.',
  },

  // GM / CHEVROLET / BUICK / CADILLAC
  {
    code: 'P1516',
    name: 'GM Throttle Actuator Control (TAC) Module Performance',
    brand: 'GM / Chevrolet',
    category: 'Engine',
    severity: 'High',
    transitEligibility: 'EcuLimpHome',
    transitNote: 'GM Reduced Engine Power mode limits speed so you can exit traffic safely.',
    meaning: 'Commanded vs actual electronic throttle plate position diverged.',
    possibleCauses: ['Carbon buildup on throttle plate', 'Failing throttle motor', 'Loose TAC wiring harness'],
    nextSteps: 'Expect Reduced Engine Power message; drive calmly to a nearby workshop.',
    mechanicAdvice: 'Yes — inspect throttle body connector terminals and TAC motor.',
  },
  {
    code: 'P1626',
    name: 'GM Theft Deterrent Fuel Enable Signal Lost',
    brand: 'GM / Chevrolet',
    category: 'Electrical',
    severity: 'Critical',
    transitEligibility: 'HardwareLockout',
    meaning: 'Body Control Module did not send the Passlock/Passkey fuel enable signal to the ECM.',
    possibleCauses: ['Ignition Passlock sensor fault', 'Low battery voltage during cranking'],
    nextSteps: 'Cannot be bypassed via OBD-II; arrange dealer or locksmith Passlock diagnostics.',
    mechanicAdvice: 'Yes — verify BCM-to-ECM security handshake.',
  },

  // VOLKSWAGEN / AUDI (VAG)
  {
    code: 'P1128',
    name: 'VW / Audi Long Term Fuel Trim Multiplicative System Too Lean (Bank 1)',
    brand: 'Volkswagen / Audi',
    category: 'Fuel & Air',
    severity: 'Medium',
    transitEligibility: 'EcuLimpHome',
    meaning: 'ECU is adding extra fuel at engine load to compensate for unmetered air or low fuel flow.',
    possibleCauses: ['Torn PCV/crankcase breather diaphragm', 'MAF sensor contamination', 'Vacuum hose split'],
    nextSteps: 'Drive gently to a VW/Audi specialist for smoke pressure testing.',
    mechanicAdvice: 'Yes — check PCV valve diaphragm and boost/vacuum hoses.',
  },
  {
    code: 'P1570',
    name: 'VW / Audi Engine Control Module Disabled by Immobilizer',
    brand: 'Volkswagen / Audi',
    category: 'Electrical',
    severity: 'Critical',
    transitEligibility: 'HardwareLockout',
    meaning: 'Engine starts for 1 second then shuts down because the instrument cluster immobilizer blocked ECM authorization.',
    possibleCauses: ['Unmatched key transponder', 'Cluster/reader coil fault'],
    nextSteps: 'Try spare factory key; OBD-II scanners cannot bypass VAG immobilizer lockouts.',
    mechanicAdvice: 'Yes — VAG dealer or licensed immobilizer specialist needed.',
  },

  // BMW / MINI
  {
    code: 'P1083',
    name: 'BMW / MINI Fuel Control Mixture Lean (Bank 1)',
    brand: 'BMW / MINI',
    category: 'Fuel & Air',
    severity: 'Medium',
    transitEligibility: 'EcuLimpHome',
    meaning: 'DME reached maximum rich correction limit on Bank 1.',
    possibleCauses: ['Cracked intake boot or DISA valve seal', 'Failing fuel pump'],
    nextSteps: 'Drive gently to a BMW specialist.',
    mechanicAdvice: 'Yes — smoke test intake and check fuel pressure.',
  },
  {
    code: 'P1415',
    name: 'BMW / MINI Secondary Air Injection System Bank 1',
    brand: 'BMW / MINI',
    category: 'Emissions',
    severity: 'Low',
    transitEligibility: 'Clearable',
    meaning: 'Cold-start secondary air pump flow did not register on oxygen sensors.',
    possibleCauses: ['Blocked secondary air valve', 'Failed air pump relay or vacuum line'],
    nextSteps: 'Does not affect warm driving; book a routine check.',
    mechanicAdvice: 'Yes — test secondary air pump relay and check valve.',
  },

  // MERCEDES-BENZ
  {
    code: 'P2004',
    name: 'Mercedes-Benz Intake Manifold Runner Control Stuck Open (Bank 1)',
    brand: 'Mercedes-Benz',
    category: 'Engine',
    severity: 'Medium',
    transitEligibility: 'EcuLimpHome',
    meaning: 'Tumble flap linkage on the intake manifold is stuck or broken.',
    possibleCauses: ['Worn plastic swirl-flap linkage', 'Carbon buildup on intake runners'],
    nextSteps: 'Car starts and drives; low-end torque may feel softer until repaired.',
    mechanicAdvice: 'Yes — inspect intake manifold actuator linkage.',
  },

  // HYUNDAI / KIA
  {
    code: 'P1690',
    name: 'Hyundai / Kia Smartra Immobilizer Error',
    brand: 'Hyundai / Kia',
    category: 'Electrical',
    severity: 'Critical',
    transitEligibility: 'HardwareLockout',
    meaning: 'Smartra immobilizer module failed to authenticate the key before fuel injection.',
    possibleCauses: ['Key coil antenna disconnect', 'Smartra module failure', 'Unprogrammed key'],
    nextSteps: 'Try spare key; if engine cranks without firing, arrange tow to service centre.',
    mechanicAdvice: 'Yes — immobilizer antenna and Smartra module check required.',
  },
  {
    code: 'P1166',
    name: 'Hyundai / Kia Limit of O2 Sensor Fuel Adaptation Reached (Bank 1)',
    brand: 'Hyundai / Kia',
    category: 'Fuel & Air',
    severity: 'Medium',
    transitEligibility: 'EcuLimpHome',
    meaning: 'Fuel adaptive trim hit its ceiling on Bank 1.',
    possibleCauses: ['Intake air leak', 'Dirty MAF sensor', 'Weak fuel pressure'],
    nextSteps: 'Drive calmly to a service centre.',
    mechanicAdvice: 'Yes — inspect intake gaskets and fuel pressure.',
  },

  // NISSAN / INFINITI
  {
    code: 'P1610',
    name: 'Nissan / Infiniti Lock Mode (NATS Anti-Theft Engaged)',
    brand: 'Nissan / Infiniti',
    category: 'Electrical',
    severity: 'Critical',
    transitEligibility: 'HardwareLockout',
    transitNote: 'Nissan NATS Lock Mode locks engine starting after repeated invalid key attempts; OBD-II cannot bypass NATS.',
    meaning: 'Nissan Anti-Theft System (NATS) entered Lock Mode after multiple unrecognized key reads.',
    possibleCauses: ['Unregistered key used repeatedly', 'NATS antenna ring failure'],
    nextSteps: 'Do not force ignition; contact Nissan dealer or certified locksmith.',
    mechanicAdvice: 'Yes — NATS key re-initialization required.',
  },
  {
    code: 'U1000',
    name: 'Nissan / Infiniti / GM CAN Communication Line Fault',
    brand: 'Nissan / Infiniti',
    category: 'Electrical',
    severity: 'High',
    transitEligibility: 'HardwareLockout',
    meaning: 'Control unit could not transmit or receive frames on the CAN bus within timeout limits.',
    possibleCauses: ['Corroded ECM ground strap', 'Damaged CAN twisted-pair wiring'],
    nextSteps: 'If gauges drop or car fails to start, seek electrical diagnostics.',
    mechanicAdvice: 'Yes — check ECM ground points and CAN bus termination.',
  },

  // STELLANTIS (JEEP / DODGE / CHRYSLER / FIAT)
  {
    code: 'P1521',
    name: 'Stellantis / Jeep Incorrect Engine Oil Viscosity Detected',
    brand: 'Stellantis / Jeep',
    category: 'Engine',
    severity: 'Medium',
    transitEligibility: 'Clearable',
    meaning: 'VVT/MDS solenoid response indicates oil viscosity differs from factory specification.',
    possibleCauses: ['Wrong oil weight used at last oil change', 'Degraded or overdue engine oil'],
    nextSteps: 'Schedule an oil service with manufacturer-spec oil soon.',
    mechanicAdvice: 'Yes — replace oil and filter with exact OEM grade.',
  },

  // SUBARU / MAZDA
  {
    code: 'P1718',
    name: 'Subaru / Mazda AT CAN Communication Circuit',
    brand: 'Subaru / Mazda',
    category: 'Transmission',
    severity: 'High',
    transitEligibility: 'EcuLimpHome',
    meaning: 'Communication error between automatic transmission control unit and engine ECM.',
    possibleCauses: ['Corroded transmission bulkhead connector', 'Low battery voltage'],
    nextSteps: 'Drive gently on local roads to a workshop.',
    mechanicAdvice: 'Yes — inspect TCM connectors and battery health.',
  },

  // TATA / MAHINDRA / MARUTI SUZUKI
  {
    code: 'P1614',
    name: 'Suzuki / Maruti Transponder Key Code Not Matched',
    brand: 'Tata / Mahindra / Suzuki',
    category: 'Electrical',
    severity: 'Critical',
    transitEligibility: 'HardwareLockout',
    meaning: 'Immobilizer control module rejected the transponder signal from the ignition key.',
    possibleCauses: ['Damaged key transponder', 'Immobilizer coil ring fault'],
    nextSteps: 'Try spare factory key; if immobilizer light blinks and car will not start, arrange tow.',
    mechanicAdvice: 'Yes — authorized immobilizer key matching needed.',
  },
  {
    code: 'P2299',
    name: 'Brake Pedal Position / Accelerator Pedal Position Incompatible',
    brand: 'Tata / Mahindra / Suzuki',
    category: 'Sensors',
    severity: 'High',
    transitEligibility: 'EcuLimpHome',
    transitNote: 'ECU cuts accelerator response when brake and throttle signals conflict.',
    meaning: 'ECU detected simultaneous brake switch and accelerator pedal activation or a sticking switch.',
    possibleCauses: ['Misadjusted brake light switch', 'Floor mat pressing pedal', 'Faulty pedal sensor'],
    nextSteps: 'Ensure floor mat is clear of pedals; drive cautiously to a workshop.',
    mechanicAdvice: 'Yes — inspect brake pedal switch and APP sensor data.',
  },
];

function inferSubsystemFromDigit(letter: string, thirdChar: string): {
  category: ObdCategory;
  subsystemLabel: string;
} {
  if (letter === 'U') return { category: 'Electrical', subsystemLabel: 'Vehicle Network / CAN Bus Communication' };
  if (letter === 'B') return { category: 'Electrical', subsystemLabel: 'Body, Restraints & Comfort Control' };
  if (letter === 'C') return { category: 'Sensors', subsystemLabel: 'Chassis, ABS & Steering Control' };

  switch (thirdChar) {
    case '1':
    case '2':
      return { category: 'Fuel & Air', subsystemLabel: 'Fuel & Air Metering' };
    case '3':
      return { category: 'Ignition', subsystemLabel: 'Ignition System or Cylinder Misfire' };
    case '4':
      return { category: 'Emissions', subsystemLabel: 'Auxiliary Emission Controls' };
    case '5':
      return { category: 'Electrical', subsystemLabel: 'Vehicle Speed, Idle Control & Auxiliary Inputs' };
    case '6':
      return { category: 'Electrical', subsystemLabel: 'Computer & Auxiliary Output Circuits' };
    case '7':
    case '8':
    case '9':
      return { category: 'Transmission', subsystemLabel: 'Transmission & Drivetrain Control' };
    default:
      return { category: 'Engine', subsystemLabel: 'Powertrain & Engine Management' };
  }
}

export function findObdCodeDetails(
  code: string,
  customCodes: ObdCodeEntry[] = []
): ObdCodeEntry {
  const normalized = code.trim().toUpperCase();
  const customMatch = customCodes.find((c) => c.code.toUpperCase() === normalized);
  if (customMatch) return customMatch;

  const standardMatch = STANDARD_OBD_CODES.find((c) => c.code.toUpperCase() === normalized);
  if (standardMatch) return standardMatch;

  const isValidFormat = /^[PCBU][0-3][0-9A-F]{3}$/.test(normalized);
  const letter = normalized[0] || 'P';
  const scopeDigit = normalized[1] || '0';
  const subsystemDigit = normalized[2] || '0';

  const { category, subsystemLabel } = inferSubsystemFromDigit(letter, subsystemDigit);
  const isGeneric = scopeDigit === '0' || scopeDigit === '2';

  const systemWord =
    letter === 'P'
      ? 'Powertrain'
      : letter === 'C'
      ? 'Chassis'
      : letter === 'B'
      ? 'Body'
      : letter === 'U'
      ? 'Network'
      : 'Vehicle';

  return {
    code: normalized,
    name: isValidFormat
      ? `${isGeneric ? 'Universal SAE' : 'Manufacturer-Specific OEM'} ${systemWord} Code (${subsystemLabel})`
      : 'Extended Vehicle Diagnostic Code',
    brand: isGeneric ? 'Universal (SAE / ISO)' : 'Manufacturer-Specific OEM',
    category,
    severity: letter === 'U' ? 'High' : 'Medium',
    transitEligibility: letter === 'U' ? 'HardwareLockout' : 'EcuLimpHome',
    transitNote:
      'Unknown OEM codes require caution: drive gently only if no critical dashboard warnings flash, and verify with a workshop scanner.',
    meaning: isValidFormat
      ? `Code ${normalized} is a ${
          isGeneric ? 'standard universal' : 'manufacturer-specific OEM'
        } ${systemWord.toLowerCase()} trouble code pointing to the ${subsystemLabel.toLowerCase()} subsystem. A code alone does not confirm a single failed part.`
      : 'This diagnostic identifier was reported by a vehicle control module. Because extended manufacturer codes vary by brand, targeted workshop testing is required.',
    possibleCauses: [
      `${subsystemLabel} sensor reading outside expected range`,
      'Loose, corroded, or moisture-affected wiring connector',
      'Component wear or calibration drift inside the reported subsystem',
    ],
    nextSteps:
      'Observe how the vehicle drives. If the engine stalls, overheats, or flashes a warning light, stop safely and arrange roadside assistance.',
    mechanicAdvice:
      'Yes — a technician with an OEM-capable scan tool can read manufacturer-specific descriptions and live freeze-frame data for this code.',
  };
}

export const TRANSIT_CONTROL_PROFILES = [
  {
    id: 'strict_eco' as const,
    label: 'Strict Eco Limp Crawl',
    maxSpeedKmh: 25,
    maxRpm: 2000,
    maxThrottlePct: 30,
    maxDistanceKm: 10,
    description:
      'Conservative crawl cap for moderate ECU fallback faults—protects engine/transmission on short workshop trips.',
  },
  {
    id: 'city_crawl' as const,
    label: 'City Workshop Transit',
    maxSpeedKmh: 40,
    maxRpm: 2500,
    maxThrottlePct: 45,
    maxDistanceKm: 20,
    description:
      'Balanced urban transit cap limiting RPM and throttle load while keeping secondary safety monitors active.',
  },
  {
    id: 'direct_service' as const,
    label: 'Direct Service Route',
    maxSpeedKmh: 55,
    maxRpm: 3000,
    maxThrottlePct: 60,
    maxDistanceKm: 35,
    requiresAllClearable: true,
    description:
      'Available only when all selected faults are low-risk latching indicators (e.g. EVAP, O2 heater, secondary trim).',
  },
];

export function classifySensorBypassEligibility(entry: ObdCodeEntry): {
  tier: 'LowRiskEligible' | 'ModerateLimpCapped' | 'VeryHighRiskBlocked';
  canBypassInTransit: boolean;
  label: string;
  reason: string;
} {
  if (entry.transitEligibility === 'HardwareLockout' || entry.severity === 'Critical') {
    return {
      tier: 'VeryHighRiskBlocked',
      canBypassInTransit: false,
      label: 'Very High Risk · Blocked',
      reason:
        entry.transitNote ??
        'Safety-critical timing, immobilizer, fuel pressure, thermal, or HV isolation sensor cannot be bypassed.',
    };
  }

  if (entry.transitEligibility === 'EcuLimpHome' || entry.severity === 'High') {
    return {
      tier: 'ModerateLimpCapped',
      canBypassInTransit: true,
      label: 'Moderate Risk · Speed/RPM Capped',
      reason:
        entry.transitNote ??
        'Eligible for speed- and RPM-limited ECU fallback transit to reach a nearby workshop safely.',
    };
  }

  return {
    tier: 'LowRiskEligible',
    canBypassInTransit: true,
    label: 'Low Risk · Controlled Bypass Eligible',
    reason:
      entry.transitNote ??
      'Non-critical emissions/secondary sensor eligible for Mode $04 transit clearing under speed cap.',
  };
}

