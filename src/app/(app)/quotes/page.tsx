import QuoteGeneratorClient from '@/components/quotes/QuoteGeneratorClient';

export default function QuotesPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-headline font-bold text-gradient-red">Citas Motivacionales</h1>
        <p className="text-muted-foreground">Impulsa tu día con una dosis de inspiración generada por IA.</p>
      </div>
      <QuoteGeneratorClient />
    </div>
  );
}
