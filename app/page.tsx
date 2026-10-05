import { projects, reel } from '@/content/projects';
import { photographs, photos } from '@/content/photos';
import { PageTransition } from '@/components/PageTransition';
import { Hero } from '@/components/hero/Hero';
import { Reel } from '@/components/reel/Reel';
import { Photographs } from '@/components/photographs/Photographs';
import { Program } from '@/components/program/Program';
import { Process } from '@/components/Process';
import { Contact, SiteFooter } from '@/components/Closing';

export default function Home() {
  return (
    <PageTransition>
      <main id="main" tabIndex={-1}>
        <Hero filmCount={projects.length} />
        <Reel films={reel} />
        <Photographs title={photographs.title} intro={photographs.intro} photos={photos} />
        <Program projects={projects} />
        <Process />
        <Contact />
        <SiteFooter />
      </main>
    </PageTransition>
  );
}
