const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';

export interface AIReflection {
  keyPoints: string[];
  questions: string[];
  suggestions: string[];
}

// Fallback reflection when API fails
function getFallbackReflection(): AIReflection {
  return {
    keyPoints: [
      'การบันทึกความคิดช่วยจัดระเบียบไอเดีย',
      'การสะท้อนคิดอย่างสม่ำเสมอพัฒนาทักษะวิชาชีพ',
      'ความรู้ที่บันทึกไว้สามารถแชร์และสร้างคุณค่าให้องค์กร'
    ],
    questions: [
      'ประเด็นหลักของบันทึกนี้คืออะไร?',
      'มีใครที่ควรได้รับประโยชน์จากความรู้นี้?',
      'จะนำไปต่อยอดได้อย่างไร?'
    ],
    suggestions: [
      'เพิ่มรายละเอียดหรือตัวอย่างประกอบ',
      'พิจารณาแชร์กับกลุ่ม PLC',
      'ติดตามผลและบันทึกความก้าวหน้า'
    ]
  };
}

export async function generateReflection(transcript: string): Promise<AIReflection> {
  console.log('Generating AI reflection via Edge Function...');
  
  if (!SUPABASE_URL) {
    console.warn('SUPABASE_URL not configured, using fallback');
    return getFallbackReflection();
  }

  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/ai-reflection`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ transcript }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Edge Function error:', response.status, errorData);
      throw new Error(errorData.error || `API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Validate response structure
    if (data.keyPoints && data.questions && data.suggestions) {
      return data as AIReflection;
    }
    
    throw new Error('Invalid response structure');
  } catch (error) {
    console.error('AI reflection error:', error);
    return getFallbackReflection();
  }
}
