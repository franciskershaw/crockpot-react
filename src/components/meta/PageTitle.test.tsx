import { render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { PageTitle } from "./PageTitle";

const SITE_DEFAULT = "Crockpot | Never write a shopping list again";

// Stands in for index.html's own <title>.
let siteDefault: HTMLTitleElement;
beforeEach(() => {
  siteDefault = document.createElement("title");
  siteDefault.textContent = SITE_DEFAULT;
  document.head.append(siteDefault);
});
afterEach(() => {
  siteDefault.remove();
});

describe("PageTitle", () => {
  it("titles the tab with the page name and the site name", () => {
    render(<PageTitle>Menu</PageTitle>);

    expect(document.title).toBe("Menu | Crockpot");
  });

  it("puts the site default back when the page goes", () => {
    const { unmount } = render(<PageTitle>Menu</PageTitle>);

    unmount();

    expect(document.title).toBe(SITE_DEFAULT);
  });
});
