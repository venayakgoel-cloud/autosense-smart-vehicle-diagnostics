import type { ObdCodeEntry, SeverityLevel } from '../types/autosense';

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

export const STANDARD_OBD_CODES: ObdCodeEntry[] = [
  {
    code: 'P0300',
    name: 'Random or Multiple Cylinder Misfire Detected',
    category: 'Ignition',
    severity: 'High',
    meaning:
      'Your engine control computer noticed that fuel is not burning smoothly inside two or more engine cylinders. A diagnostic code alone does not pinpoint the single worn part, so further testing is required.',
    possibleCauses: [
      'Worn spark plugs or ignition coils',
      'Fuel delivery irregularity (clogged injector or low fuel pressure)',
      'Vacuum leak letting unmetered air into the intake',
      'Sensor signal issue affecting timing or air-fuel balance',
    ],
    nextSteps:
      'Avoid hard acceleration, towing, or highway speeds. If the Check Engine Light is flashing, pull over safely and turn off the engine to protect the catalytic converter.',
    mechanicAdvice:
      'Yes — schedule a prompt inspection with a certified mechanic so they can run ignition, fuel pressure, and compression tests safely.',
  },
  {
    code: 'P0171',
    name: 'System Too Lean (Bank 1)',
    category: 'Fuel & Air',
    severity: 'Medium',
    meaning:
      'The engine is receiving more air or less fuel than expected on engine Bank 1. The computer is compensating, which can slightly reduce fuel economy or cause rough idling.',
    possibleCauses: [
      'Small air leak in an intake hose or vacuum line',
      'Dirty or inaccurately reading Mass Air Flow (MAF) sensor',
      'Aging oxygen sensor reporting skewed exhaust readings',
      'Restricted fuel filter or weakening fuel pump delivery',
    ],
    nextSteps:
      'You can generally drive carefully to a nearby service centre, while avoiding heavy engine loads. Monitor for rough idle or stalling.',
    mechanicAdvice:
      'Yes — have a technician perform a smoke leak check and sensor data verification rather than replacing parts by guesswork.',
  },
  {
    code: 'P0420',
    name: 'Catalyst System Efficiency Below Threshold (Bank 1)',
    category: 'Emissions',
    severity: 'Low',
    meaning:
      'The exhaust monitoring sensors indicate that the catalytic converter may not be reducing exhaust emissions as effectively as designed. This typically does not cause an immediate breakdown.',
    possibleCauses: [
      'Aging catalytic converter core',
      'Faulty downstream oxygen sensor giving false readings',
      'Small exhaust leak ahead of the rear sensor',
      'Previous engine misfire or rich fuel condition',
    ],
    nextSteps:
      'Safe for normal local driving, though fuel economy may dip slightly and the vehicle may not pass emissions testing until inspected.',
    mechanicAdvice:
      'Recommended — book a routine inspection to test oxygen sensor waveforms before assuming a full catalytic converter replacement is needed.',
  },
  {
    code: 'P0128',
    name: 'Coolant Thermostat Below Regulating Temperature',
    category: 'Engine',
    severity: 'Low',
    meaning:
      'The engine coolant is taking longer than normal to reach its ideal operating temperature. Running slightly cool increases fuel consumption and cabin heater warm-up time.',
    possibleCauses: [
      'Thermostat valve stuck partially open',
      'Inaccurate engine coolant temperature sensor',
      'Low coolant level (only check when engine is completely cold)',
    ],
    nextSteps:
      'Safe to drive normally, but watch your dashboard temperature gauge for unusual drops or spikes and schedule maintenance soon.',
    mechanicAdvice:
      'Yes — a mechanic can verify actual coolant temperature with a thermal scan and inspect the cooling circuit safely.',
  },
  {
    code: 'P0118',
    name: 'Engine Coolant Temperature Sensor Circuit High',
    category: 'Sensors',
    severity: 'Critical',
    meaning:
      'The computer is receiving an abnormally high voltage signal from the coolant temperature sensor, or the engine may be at risk of inaccurate cooling fan control.',
    possibleCauses: [
      'Damaged or disconnected coolant temperature sensor wiring',
      'Failed coolant temperature sensor',
      'Severe coolant loss or air pocket in cooling system',
    ],
    nextSteps:
      'Stop safely as soon as possible if you see steam, smell sweet coolant, or see the temperature warning gauge climb into the red zone. Never open a hot radiator cap.',
    mechanicAdvice:
      'Yes — immediate professional inspection or roadside assistance is strongly advised before continued driving.',
  },
  {
    code: 'P0455',
    name: 'Evaporative Emission System Large Leak Detected',
    category: 'Emissions',
    severity: 'Low',
    meaning:
      'Fuel vapors from the fuel tank are escaping instead of staying sealed inside the evaporative recovery system.',
    possibleCauses: [
      'Fuel cap not tightened until it clicks or worn cap seal',
      'Cracked evaporative vapor hose',
      'Stuck purge or vent solenoid valve',
    ],
    nextSteps:
      'Check that your fuel filler cap is clean and tightened firmly. It may take several normal driving trips for the warning light to reset if the cap was loose.',
    mechanicAdvice:
      'If the warning persists after tightening the fuel cap, book a routine EVAP smoke test at a service centre.',
  },
  {
    code: 'P0562',
    name: 'System Voltage Low',
    category: 'Electrical',
    severity: 'High',
    meaning:
      'The vehicle electrical voltage dropped below the minimum threshold required for reliable electronics, ignition, and safety control modules.',
    possibleCauses: [
      'Weak or aging 12V starter battery',
      'Alternator not charging the battery sufficiently',
      'Loose or corroded battery terminal clamps',
    ],
    nextSteps:
      'Switch off non-essential accessories (heated seats, high-draw audio) and drive directly to a safe parking spot or service centre. The car may fail to restart once turned off.',
    mechanicAdvice:
      'Yes — have a technician perform a load test on both the battery and alternator charging output promptly.',
  },
  {
    code: 'P0335',
    name: 'Crankshaft Position Sensor A Circuit Malfunction',
    category: 'Sensors',
    severity: 'Critical',
    meaning:
      'The engine computer lost the primary rotation timing signal from the crankshaft sensor. This can cause sudden stalling or prevent the engine from starting.',
    possibleCauses: [
      'Failing crankshaft position sensor',
      'Damaged wiring harness or connector near the lower engine block',
      'Reluctor ring debris or timing signal interference',
    ],
    nextSteps:
      'If the engine hesitates, stalls, or struggles to start, pull over to a safe location and arrange towing rather than risking a stall in traffic.',
    mechanicAdvice:
      'Yes — arrange prompt professional diagnostic testing with an oscilloscope or factory-grade scanner.',
  },
  {
    code: 'P0700',
    name: 'Transmission Control System Malfunction',
    category: 'Transmission',
    severity: 'High',
    meaning:
      'The transmission computer has detected an issue and requested the Check Engine Light. The car may enter limp mode with limited gears to prevent internal damage.',
    possibleCauses: [
      'Low or degraded transmission fluid',
      'Faulty transmission speed sensor or shift solenoid',
      'Communication fault between engine and transmission modules',
    ],
    nextSteps:
      'Drive gently and avoid steep hills or highway merging if shifting feels harsh or delayed. Have the vehicle inspected promptly.',
    mechanicAdvice:
      'Yes — a transmission specialist should read the specific sub-codes stored inside the Transmission Control Module (TCM).',
  },
  {
    code: 'U0100',
    name: 'Lost Communication With Engine Control Module (ECM)',
    category: 'Electrical',
    severity: 'Critical',
    meaning:
      'Other vehicle modules could not exchange data over the internal CAN bus network with the main engine computer.',
    possibleCauses: [
      'Weak battery voltage causing module brownouts',
      'Blown fuse or faulty ECM power relay',
      'Damaged CAN bus wiring or corroded ground connection',
    ],
    nextSteps:
      'If dashboard gauges drop out or the car refuses to shift/start, park safely and seek professional electrical diagnostics.',
    mechanicAdvice:
      'Yes — modern CAN network diagnostics require specialized multimeter and bus testing by a qualified automotive electrician.',
  },
  {
    code: 'P0101',
    name: 'Mass Air Flow (MAF) Sensor Circuit Range/Performance',
    category: 'Fuel & Air',
    severity: 'Medium',
    meaning:
      'The airflow measured entering the engine does not match what the computer expects for your current throttle and engine speed.',
    possibleCauses: [
      'Clogged or improperly seated engine air filter',
      'Contaminated MAF sensor element',
      'Unmetered air leak between the sensor and throttle body',
    ],
    nextSteps:
      'You can usually drive carefully to a service centre; expect slightly sluggish acceleration or lower fuel economy until checked.',
    mechanicAdvice:
      'Yes — have a technician inspect the air filter housing, intake ducts, and live airflow readings.',
  },
  {
    code: 'P0401',
    name: 'Exhaust Gas Recirculation (EGR) Flow Insufficient',
    category: 'Emissions',
    severity: 'Medium',
    meaning:
      'Less exhaust gas than expected is recirculating back into the intake to lower combustion temperatures and nitrogen oxide emissions.',
    possibleCauses: [
      'Carbon buildup blocking EGR valve or passages',
      'Faulty EGR position sensor or vacuum control solenoid',
      'Exhaust pressure sensor restriction',
    ],
    nextSteps:
      'Schedule a service check soon; prolonged driving can raise combustion temperatures and trigger engine knocking under load.',
    mechanicAdvice:
      'Yes — ask a technician to command-test the EGR valve and inspect passages for carbon deposits.',
  },
];

export function findObdCodeDetails(
  code: string,
  customCodes: ObdCodeEntry[] = []
): ObdCodeEntry {
  const normalized = code.trim().toUpperCase();
  const customMatch = customCodes.find((c) => c.code.toUpperCase() === normalized);
  if (customMatch) return customMatch;

  const standardMatch = STANDARD_OBD_CODES.find((c) => c.code.toUpperCase() === normalized);
  if (standardMatch) return standardMatch;

  return {
    code: normalized,
    name: 'Manufacturer or Extended OBD-II Diagnostic Code',
    category: 'Engine',
    severity: 'Medium',
    meaning:
      'This code was reported by an onboard vehicle control module. Because extended codes vary across manufacturers, a trouble code alone does not confirm a single mechanical fault.',
    possibleCauses: [
      'Sensor reading outside normal manufacturer calibration',
      'Intermittent wiring connector or moisture intrusion',
      'Subsystem component wear requiring targeted testing',
    ],
    nextSteps:
      'Observe how the vehicle drives. If you notice unusual noises, warning lights flashing, or reduced power, stop safely and seek assistance.',
    mechanicAdvice:
      'Yes — a qualified mechanic with manufacturer-specific diagnostic software can read live freeze-frame data for this exact code.',
  };
}
