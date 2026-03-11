type CardItem = {
  image?: string;
  title: string;
  price: number;
  onBook: (courtName: string) => void;
};

export const FutsalBookingCard: React.FC<CardItem> = ({ title, price, image, onBook }) => {
  return (
    <>
      <div className="bg-white dark:bg-gray-900 dark:border-gray-800 rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 w-full">
        {/* Image */}
        <img className="w-full h-48 object-cover" src={image} alt={title} />

        {/* Content */}
        <div className="p-4 space-y-3">
          <h2 className="text-lg font-semibold dark:text-gray-300">{title}</h2>

          <p className="text-green-600 font-bold text-md">Rp. {price.toLocaleString("id-ID")} / Jam</p>
          <button
            onClick={() => onBook(title)}
            className="
          w-full
          bg-blue-600
          text-white
          py-2
          rounded-lg
          hover:bg-blue-300
          hover:text-black
          active:scale-95
          transition
          "
          >
            Book Now
          </button>
        </div>
      </div>
    </>
  );
};
