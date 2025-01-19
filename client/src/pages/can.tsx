const renderPlayerStats = (
    stats: PlayerStats | null,
    isOpponent: boolean
  ) => (
    <div
      className={`w-[45%] p-4 bg-white rounded-lg border-2 ${
        isOpponent ? "border-red-500" : "border-green-500"
      }`}
    >
      {stats ? (
        <>
          <p className="text-lg font-bold text-gray-800">
            {felt252ToString(stats.name)}
          </p>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>
              <strong>Level:</strong> {stats.level.toString()}
            </li>
            <li>
              <strong>Experience:</strong> {stats.exp.toString()}
            </li>
            <li>
              <strong>Gold:</strong> {stats.gold.toString()}
            </li>
            <li>
              <strong>Trophies:</strong> {stats.trophies.toString()}
            </li>
            <li>
              <strong>Food:</strong> {stats.food.toString()}
            </li>
          </ul>
        </>
      ) : (
        <p className="text-gray-500">Waiting for stats...</p>
      )}
    </div>
  );