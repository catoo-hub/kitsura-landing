import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface Testimonial {
  name: string;
  city: string;
  text: string;
}

interface TestimonialsGridProps {
  testimonials: Testimonial[];
}

export function TestimonialsGrid({ testimonials }: TestimonialsGridProps) {
  if (!testimonials.length) {
    return null;
  }

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {testimonials.map((testimonial) => (
        <Card
          key={testimonial.name}
          className="rounded-3xl border-border/70 bg-card/90"
        >
          <CardHeader className="gap-3">
            <div className="flex items-center gap-3">
              <Avatar className="size-12">
                <AvatarFallback>
                  {testimonial.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-lg">{testimonial.name}</CardTitle>
                <CardDescription>{testimonial.city}</CardDescription>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-foreground/80">
              {testimonial.text}
            </p>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}
