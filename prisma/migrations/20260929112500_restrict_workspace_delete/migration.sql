ALTER TABLE "Client" DROP CONSTRAINT "Client_workspaceId_fkey";
ALTER TABLE "Client" ADD CONSTRAINT "Client_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "ComplianceItem" DROP CONSTRAINT "ComplianceItem_workspaceId_fkey";
ALTER TABLE "ComplianceItem" ADD CONSTRAINT "ComplianceItem_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "LegalCase" DROP CONSTRAINT "LegalCase_workspaceId_fkey";
ALTER TABLE "LegalCase" ADD CONSTRAINT "LegalCase_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "LegalDocument" DROP CONSTRAINT "LegalDocument_workspaceId_fkey";
ALTER TABLE "LegalDocument" ADD CONSTRAINT "LegalDocument_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Task" DROP CONSTRAINT "Task_workspaceId_fkey";
ALTER TABLE "Task" ADD CONSTRAINT "Task_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "TimeEntry" DROP CONSTRAINT "TimeEntry_workspaceId_fkey";
ALTER TABLE "TimeEntry" ADD CONSTRAINT "TimeEntry_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "ResearchItem" DROP CONSTRAINT "ResearchItem_workspaceId_fkey";
ALTER TABLE "ResearchItem" ADD CONSTRAINT "ResearchItem_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Invoice" DROP CONSTRAINT "Invoice_workspaceId_fkey";
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Course" DROP CONSTRAINT "Course_workspaceId_fkey";
ALTER TABLE "Course" ADD CONSTRAINT "Course_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Lecture" DROP CONSTRAINT "Lecture_workspaceId_fkey";
ALTER TABLE "Lecture" ADD CONSTRAINT "Lecture_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "AcademicDeadline" DROP CONSTRAINT "AcademicDeadline_workspaceId_fkey";
ALTER TABLE "AcademicDeadline" ADD CONSTRAINT "AcademicDeadline_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "LegalTerm" DROP CONSTRAINT "LegalTerm_workspaceId_fkey";
ALTER TABLE "LegalTerm" ADD CONSTRAINT "LegalTerm_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "CaseEntry" DROP CONSTRAINT "CaseEntry_workspaceId_fkey";
ALTER TABLE "CaseEntry" ADD CONSTRAINT "CaseEntry_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "ReviewSession" DROP CONSTRAINT "ReviewSession_workspaceId_fkey";
ALTER TABLE "ReviewSession" ADD CONSTRAINT "ReviewSession_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
