import Why from '@/modules/home/sections';
import Banner from '@/modules/home/sections/Banner';
import Image from 'next/image';

export default function Home() {
  return (
    <div>
      <Banner />
      <Why />
    </div>
  );
}
