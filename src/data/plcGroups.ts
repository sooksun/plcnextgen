/**
 * กลุ่ม PLC ใช้ร่วมกัน: เลือกแชร์ (ShareDecisionModal) และแสดงรายการใน PLCDetailScreen
 */
export const PLC_GROUPS = [
  { id: 'plc-math', name: 'PLC คณิตศาสตร์' },
  { id: 'plc-science', name: 'PLC วิทยาศาสตร์' },
  { id: 'plc-thai', name: 'PLC ภาษาไทย' },
  { id: 'plc-english', name: 'PLC ภาษาอังกฤษ' },
  { id: 'plc-social', name: 'PLC สังคมศึกษา' },
  { id: 'plc-arts', name: 'PLC ศิลปะ' }
] as const;

export function getPlcIdByName(plcName: string): string | undefined {
  return PLC_GROUPS.find((g) => g.name === plcName)?.id;
}

export function getPlcNameById(plcId: string): string | undefined {
  return PLC_GROUPS.find((g) => g.id === plcId)?.name;
}
