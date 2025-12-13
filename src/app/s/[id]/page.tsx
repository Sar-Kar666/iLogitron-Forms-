import React from 'react';
import { notFound } from 'next/navigation';
import { PublicFormRenderer } from '@/components/Renderer/PublicFormRenderer';
import { prisma } from '@/lib/prisma';
import { EditorQuestion } from '@/types/editor';

interface PublicFormPageProps {
    params: Promise<{
        id: string;
    }>;
}

export default async function PublicFormPage({ params }: PublicFormPageProps) {
    const { id } = await params;

    // Mock Fetch or Real Fetch Logic
    // Since we haven't set up the DB locally effectively yet (docker issue), we can try to fetch, 
    // but if it fails we might fallback for demo if needed.
    // Ideally, use prisma.form.findUnique...

    /* 
    const form = await prisma.form.findUnique({
      where: { id },
      include: {
          sections: {
              include: {
                  questions: {
                      orderBy: { order: 'asc' }
                  }
              },
              orderBy: { order: 'asc' }
          }
      }
    });
  
    if (!form) return notFound();
    
    // Flatten sections to questions for now as Renderer expects flat list MVP
    const questions = form.sections.flatMap(s => s.questions) as EditorQuestion[];
    */

    // MOCK DATA FOR DEMO if DB is unreachable in this env
    // (Remove this for prod)
    const form = {
        id,
        title: "Sample Quiz",
        description: "This is a public view of the form.",
        questions: [
            {
                id: "q1",
                type: "SHORT_TEXT",
                label: "What is your name?",
                required: true,
                order: 0,
                sectionId: "s1",
                helpText: null,
                options: [],
                validation: null,
                points: 0,
                metadata: null
            },
            {
                id: "q2",
                type: "MULTIPLE_CHOICE",
                label: "Which framework is this?",
                required: true,
                order: 1,
                sectionId: "s1",
                helpText: "Choose one",
                options: [{ id: "o1", label: "Next.js" }, { id: "o2", label: "Vue" }, { id: "o3", label: "Angular" }],
                validation: null,
                points: 0,
                metadata: null
            }
        ] as any[]
    };

    return (
        <div className="min-h-screen bg-[#f0ebf8]">
            <PublicFormRenderer form={form} />
        </div>
    );
}
