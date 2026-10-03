export function ChordDiagram() {
  return (
    <svg viewBox="0 0 240 220" fill="none" aria-hidden="true">
      <g stroke="#555a65" strokeWidth="1">
        {[45, 75, 105, 135, 165, 195].map((x) => (
          <path key={x} d={`M${x} 45v140`} />
        ))}
        {[45, 80, 115, 150, 185].map((y) => (
          <path key={y} d={`M45 ${y}h150`} />
        ))}
      </g>
      <path d="M44 45h152" stroke="#ebe7de" strokeWidth="5" />
      <g fill="#a9adb7" fontSize="13" textAnchor="middle">
        <text x="45" y="27">
          ×
        </text>
        <text x="135" y="27">
          ○
        </text>
        <text x="195" y="27">
          ○
        </text>
        {["E", "A", "D", "G", "B", "e"].map((s, i) => (
          <text key={i} x={45 + i * 30} y="211">
            {s}
          </text>
        ))}
      </g>
      <g fill="#E6A637">
        <circle cx="165" cy="62.5" r="12" />
        <circle cx="105" cy="97.5" r="12" />
        <circle cx="75" cy="132.5" r="12" />
      </g>
      <g fill="#111318" fontSize="12" fontWeight="700" textAnchor="middle">
        <text x="165" y="67">
          1
        </text>
        <text x="105" y="102">
          2
        </text>
        <text x="75" y="137">
          3
        </text>
      </g>
    </svg>
  );
}
