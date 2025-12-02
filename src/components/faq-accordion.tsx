import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface FaqItem {
  question: string;
  answer: string;
}

interface FaqAccordionProps {
  faq: FaqItem[];
}

export function FaqAccordion({ faq }: FaqAccordionProps) {
  if (!faq.length) {
    return null;
  }

  return (
    <Accordion
      type="single"
      collapsible
      className="rounded-3xl border border-border/70 bg-card/90 p-4"
    >
      {faq.map((item) => (
        <AccordionItem value={item.question} key={item.question}>
          <AccordionTrigger className="text-base font-medium">
            {item.question}
          </AccordionTrigger>
          <AccordionContent className="text-muted-foreground text-sm">
            {item.answer}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
