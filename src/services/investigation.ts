export type ComponentId = 'Drive bearing' | 'Coolant valve' | 'Pump casing' | 'Flow sensor' | 'Motor housing' | 'Control cabinet'

export type Investigation = {
  title: string
  system: string
  component: ComponentId
  confidence: number
  evidence: string[]
  action: string
  fallbackAction: string
  detail: string
}

/**
 * Demo-only deterministic triage. Replace this boundary with a backend request
 * that combines telemetry, work orders, and retrieved technical documentation.
 */
export function analyzeFault(input: string): Investigation {
  const text = input.toLowerCase()

  if (text.includes('flow') || text.includes('pressure') || text.includes('cavitation')) {
    return {
      title: 'Suction-side flow restriction likely',
      system: 'Process flow path',
      component: 'Coolant valve',
      confidence: 84,
      evidence: ['FLO-12 reads 38 L/min against a 52 L/min baseline.', 'VLV-08 travel is 71%; expected fully open during this duty cycle.'],
      action: 'Inspect VLV-08 position and verify the upstream strainer differential pressure.',
      fallbackAction: 'Isolate the suction leg and perform a controlled flow verification at FLO-12.',
      detail: 'The available flow signals indicate a restriction upstream of the pump inlet.',
    }
  }

  if (text.includes('temperature') || text.includes('heat') || text.includes('overheat')) {
    return {
      title: 'Pump casing thermal rise',
      system: 'Hydraulic assembly',
      component: 'Pump casing',
      confidence: 79,
      evidence: ['PMP-02 casing temperature is 11°C above its recent baseline.', 'Discharge pressure remains stable, isolating the anomaly to the pump body.'],
      action: 'Inspect the pump casing for blocked cooling passages and verify seal flush flow.',
      fallbackAction: 'Capture a thermal image of the casing and compare it to the last healthy duty cycle.',
      detail: 'The thermal rise is local to PMP-02 and is not mirrored at the motor housing.',
    }
  }

  return {
    title: 'Drive-end bearing degradation likely',
    system: 'Motor drive assembly',
    component: 'Drive bearing',
    confidence: 87,
    evidence: ['BRG-01 vibration is 9.2 mm/s; alarm threshold is 7.1 mm/s.', 'Spectral trend shows a progressive 1× rotational-frequency increase.'],
    action: 'Inspect drive-end bearing lubrication and measure radial play before the next production run.',
    fallbackAction: 'Capture a 30-second vibration sample at BRG-01 and compare the envelope spectrum.',
    detail: 'Vibration and acoustic evidence align with wear at the motor drive-end bearing.',
  }
}
