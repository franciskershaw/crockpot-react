import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  Link,
  MemoryRouter,
  Route,
  Routes,
  useNavigate,
} from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ScrollToTop } from "./ScrollToTop";

function GoBack() {
  const navigate = useNavigate();
  return (
    <button type="button" onClick={() => navigate(-1)}>
      Back
    </button>
  );
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("ScrollToTop", () => {
  it("scrolls to top on a push navigation to a new pathname", async () => {
    const scrollToSpy = vi
      .spyOn(window, "scrollTo")
      .mockImplementation(() => {});

    render(
      <MemoryRouter initialEntries={["/a"]}>
        <ScrollToTop />
        <Routes>
          <Route path="/a" element={<Link to="/b">Go to B</Link>} />
          <Route path="/b" element={<div>Page B</div>} />
        </Routes>
      </MemoryRouter>,
    );
    scrollToSpy.mockClear();

    await userEvent.click(screen.getByText("Go to B"));

    expect(await screen.findByText("Page B")).toBeInTheDocument();
    expect(scrollToSpy).toHaveBeenCalledWith(0, 0);
  });

  it("does not scroll on a back (pop) navigation", async () => {
    const scrollToSpy = vi
      .spyOn(window, "scrollTo")
      .mockImplementation(() => {});

    render(
      <MemoryRouter initialEntries={["/a", "/b"]} initialIndex={1}>
        <ScrollToTop />
        <Routes>
          <Route path="/a" element={<div>Page A</div>} />
          <Route path="/b" element={<GoBack />} />
        </Routes>
      </MemoryRouter>,
    );
    scrollToSpy.mockClear();

    await userEvent.click(screen.getByText("Back"));

    expect(await screen.findByText("Page A")).toBeInTheDocument();
    expect(scrollToSpy).not.toHaveBeenCalled();
  });

  it("does not scroll when the destination has a hash, leaving anchor scrolling to the page", async () => {
    const scrollToSpy = vi
      .spyOn(window, "scrollTo")
      .mockImplementation(() => {});

    render(
      <MemoryRouter initialEntries={["/a"]}>
        <ScrollToTop />
        <Routes>
          <Route path="/a" element={<Link to="/b#section">Go to B</Link>} />
          <Route path="/b" element={<div>Page B</div>} />
        </Routes>
      </MemoryRouter>,
    );
    scrollToSpy.mockClear();

    await userEvent.click(screen.getByText("Go to B"));

    expect(await screen.findByText("Page B")).toBeInTheDocument();
    expect(scrollToSpy).not.toHaveBeenCalled();
  });

  it("does not scroll when only the search string changes on the same pathname", async () => {
    const scrollToSpy = vi
      .spyOn(window, "scrollTo")
      .mockImplementation(() => {});

    render(
      <MemoryRouter initialEntries={["/a"]}>
        <ScrollToTop />
        <Routes>
          <Route path="/a" element={<Link to="/a?x=1">Filter</Link>} />
        </Routes>
      </MemoryRouter>,
    );
    scrollToSpy.mockClear();

    await userEvent.click(screen.getByText("Filter"));

    expect(scrollToSpy).not.toHaveBeenCalled();
  });
});
