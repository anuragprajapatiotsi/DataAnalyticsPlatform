"use client";

import { Card, CardContent } from "@/shared/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/shared/components/ui/accordion";

export function OrganizationDescriptionCard() {
  return (
    <Card className="border-slate-200 rounded-lg shadow-none mt-4 overflow-hidden">
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="description" className="border-none">
          <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-slate-50 transition-colors">
            <span className="text-[16px] font-bold text-slate-900">
              Description
            </span>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6 pt-2">
            <p className="text-[14px] text-slate-600 font-medium leading-relaxed">
              Organization under which all the other team hierarchy is created
            </p>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  );
}
