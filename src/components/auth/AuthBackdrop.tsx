/** The original auth pages render 200 animated grid cells. */
export function AuthBackdrop() {
  return (
    <>
      {Array.from({ length: 200 }, (_, index) => (
        <span key={index} />
      ))}
    </>
  );
}
