// Tipos derivados das libs, sem import em tempo de execução (as libs são carregadas sob demanda).
export type Gsap = typeof import('gsap').gsap;
export type ScrollTriggerStatic = typeof import('gsap/ScrollTrigger').ScrollTrigger;
export type SplitTextStatic = typeof import('gsap/SplitText').SplitText;
export type SplitTextInstance = InstanceType<SplitTextStatic>;
export type Tween = ReturnType<Gsap['to']>;
export type Timeline = ReturnType<Gsap['timeline']>;
export type MatchMedia = ReturnType<Gsap['matchMedia']>;
export type LenisInstance = InstanceType<typeof import('lenis').default>;

export interface MotionLib {
  readonly gsap: Gsap;
  readonly ScrollTrigger: ScrollTriggerStatic;
  readonly SplitText: SplitTextStatic;
}
