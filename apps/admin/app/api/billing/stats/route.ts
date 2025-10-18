import { NextRequest, NextResponse } from 'next/server';
import { getDashboardStats } from '@/lib/billing-service';
import { cookies } from 'next/headers';

const TENANT_ID = 'default'; // Replace with multi-tenant logic

export async function GET(req: NextRequest) {
  try {
    // Check authentication
    const cookieStore = cookies();
    const session = cookieStore.get('admin-session');
    
    if (!session || session.value !== 'authenticated') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const stats = await getDashboardStats(TENANT_ID);

    return NextResponse.json(stats);
  } catch (error: any) {
    console.error('❌ Error fetching billing stats:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
