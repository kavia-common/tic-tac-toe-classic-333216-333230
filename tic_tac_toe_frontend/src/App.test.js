import { render, screen, fireEvent } from "@testing-library/react";
import App from "./App";

test("renders Tic-Tac-Toe title and initial status (Spoorthy/Disha hidden)", () => {
  render(<App />);
  expect(screen.getByText(/tic‑?tac‑?toe/i)).toBeInTheDocument();
  expect(screen.getByRole("status")).toHaveTextContent(/next player:\s*x/i);

  // Only visible when X wins
  expect(screen.queryByText(/spoorthy/i)).not.toBeInTheDocument();
  // Only visible when O wins
  expect(screen.queryByText(/disha/i)).not.toBeInTheDocument();
});

test("allows playing moves and alternates turns (Spoorthy/Disha still hidden)", () => {
  render(<App />);

  const cells = screen.getAllByRole("gridcell");
  fireEvent.click(cells[0]);
  expect(cells[0]).toHaveTextContent("X");
  expect(screen.getByRole("status")).toHaveTextContent(/next player:\s*o/i);

  fireEvent.click(cells[1]);
  expect(cells[1]).toHaveTextContent("O");
  expect(screen.getByRole("status")).toHaveTextContent(/next player:\s*x/i);

  expect(screen.queryByText(/spoorthy/i)).not.toBeInTheDocument();
  expect(screen.queryByText(/disha/i)).not.toBeInTheDocument();
});

test("restart clears the board (Spoorthy/Disha hidden)", () => {
  render(<App />);

  const cells = screen.getAllByRole("gridcell");
  fireEvent.click(cells[0]);
  fireEvent.click(cells[1]);

  fireEvent.click(screen.getByRole("button", { name: /restart/i }));

  // All cells should be empty again and X should start.
  screen.getAllByRole("gridcell").forEach((c) => expect(c).toHaveTextContent(""));
  expect(screen.getByRole("status")).toHaveTextContent(/next player:\s*x/i);

  expect(screen.queryByText(/spoorthy/i)).not.toBeInTheDocument();
  expect(screen.queryByText(/disha/i)).not.toBeInTheDocument();
});

test('when X wins, shows winner status, shows "Spoorthy", hides "Disha", and triggers celebration overlay', () => {
  render(<App />);

  const cells = screen.getAllByRole("gridcell");

  // X wins across the top row: 0,1,2
  fireEvent.click(cells[0]); // X
  fireEvent.click(cells[3]); // O
  fireEvent.click(cells[1]); // X
  fireEvent.click(cells[4]); // O
  fireEvent.click(cells[2]); // X wins

  expect(screen.getByRole("status")).toHaveTextContent(/winner:\s*x/i);

  // UI requirement
  expect(screen.getByText(/spoorthy/i)).toBeInTheDocument();
  expect(screen.queryByText(/disha/i)).not.toBeInTheDocument();

  // Celebration overlay should mount briefly on win.
  // It's aria-hidden, so query by class via DOM is simplest & stable.
  expect(document.querySelector(".partyLayer")).toBeTruthy();
});

test('when O wins, shows "Disha" and does NOT show "Spoorthy"', () => {
  render(<App />);

  const cells = screen.getAllByRole("gridcell");

  // Make O win across the top row (0,1,2):
  // X:3, O:0, X:4, O:1, X:8, O:2 => O wins
  fireEvent.click(cells[3]); // X
  fireEvent.click(cells[0]); // O
  fireEvent.click(cells[4]); // X
  fireEvent.click(cells[1]); // O
  fireEvent.click(cells[8]); // X
  fireEvent.click(cells[2]); // O wins

  expect(screen.getByRole("status")).toHaveTextContent(/winner:\s*o/i);
  expect(screen.queryByText(/spoorthy/i)).not.toBeInTheDocument();
  expect(screen.getByText(/disha/i)).toBeInTheDocument();
});
