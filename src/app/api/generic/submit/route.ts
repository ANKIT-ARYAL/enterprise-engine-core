import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  await new Promise((resolve) => setTimeout(resolve, 800));

  try {
    const body = await request.json().catch(() => ({}));
    
    // Process form submission or data
    
    return NextResponse.json({ success: true, message: 'Submitted successfully', data: body }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Submission failed' }, { status: 500 });
  }
}
