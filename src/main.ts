import "./style.css";

import { setupCounter } from "./counter.ts";

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
  <div class="grid grid-cols-1 place-items-center bg-amber-100 h-screen w-screen">

    <div class="card">
      <button id="counter" type="button"></button>
    </div>

  </div>
`;

setupCounter(document.querySelector<HTMLButtonElement>("#counter")!);
