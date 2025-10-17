import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/server/dto';
import { loadTutorialProgress } from '@/features/contribution/tutorial/tutorial-flow-api';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession(request.headers);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const flowId = searchParams.get('flowId');

    if (!flowId) {
      return NextResponse.json(
        { error: 'Flow ID is required' },
        { status: 400 },
      );
    }

    const progress = await loadTutorialProgress(session.user.id, flowId);

    return NextResponse.json({ progress });
  } catch (error) {
    console.error('Failed to load tutorial progress:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
