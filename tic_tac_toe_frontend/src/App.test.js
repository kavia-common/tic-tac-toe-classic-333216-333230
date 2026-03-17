import { render, screen, fireEvent } from "@testing-library/react";
import App from "./App";

test("renders Tic-Tac-Toe title and initial status", () => {
  render(<App />);
  expect(screen.getByText(/tic‑?tac‑?toe/i)).toBeInTheDocument();
  expect(screen.getByRole("status")).toHaveTextContent(/next player:\s*x/i);
});

test("allows playing moves and alternates turns", () => {
  render(<App />);

  const cells = screen.getAllByRole("gridcell");
  fireEvent.click(cells[0]);
  expect(cells[0]).toHaveTextContent("X");
  expect(screen.getByRole("status")).toHaveTextContent(/next player:\s*o/i);

  fireEvent.click(cells[1]);
  expect(cells[1]).toHaveTextContent("O");
  expect(screen.getByRole("status")).toHaveTextContent(/next player:\s*x/i);
});

test("restart clears the board", () => {
  render(<App />);

  const cells = screen.getAllByRole("gridcell");
  fireEvent.click(cells[0]);
  fireEvent.click(cells[1]);

  fireEvent.click(screen.getByRole("button", { name: /restart/i }));

  // All cells should be empty again and X should start.
  screen.getAllByRole("gridcell").forEach((c) => expect(c).toHaveTextContent(""));
  expect(screen.getByRole("status")).toHaveTextContent(/next player:\s*x/i);
});

test("winning shows winner status and triggers celebration overlay", () => {
  render(<App />);

  const cells = screen.getAllByRole("gridcell");

  // X wins across the top row: 0,1,2
  fireEvent.click(cells[0]); // X
  fireEvent.click(cells[3]); // O
  fireEvent.click(cells[1]); // X
  fireEvent.click(cells[4]); // O
  fireEvent.click(cells[2]); // X wins

  expect(screen.getByRole("status")).toHaveTextContent(/winner:\s*x/i);

  // Celebration overlay should mount briefly on win.
  // It's aria-hidden, so query by class via DOM is simplest & stable.
  expect(document.querySelector(".partyLayer")).toBeTruthy();
});
