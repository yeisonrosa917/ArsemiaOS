import type {
  Claim,
  Customer,
  Driver,
  Invoice,
  Job,
  JobStatus,
  PayrollLine,
  Route,
  Vehicle,
} from "./types";

export const drivers: Driver[] = [
  {
    id: "DRV-1042",
    name: "Marcus Reyes",
    phone: "(305) 555-2031",
    email: "marcus.r@arsemia.co",
    vehicleId: "VEH-204",
    vehicleName: "Truck #04 - ISUZU NPR 20' - 2024 - Foreman Marcus",
    status: "On Job",
    jobsCompleted: 312,
    revenueHandled: 184250,
    rating: 4.9,
    currentLocation: "Brickell, Miami",
    currentJobId: "JOB-10421",
    eta: "11:42 AM",
    documentsOk: true,
    documentExpiry: "2026-08-12",
    avatarColor: "bg-brand-500",
  },
  {
    id: "DRV-1043",
    name: "Sofia Hernandez",
    phone: "(305) 555-2032",
    email: "sofia.h@arsemia.co",
    vehicleId: "VEH-207",
    vehicleName: "Truck #07 - Mercedes Sprinter 170 - 2023 - Foreman Sofia",
    status: "En Route",
    jobsCompleted: 278,
    revenueHandled: 162100,
    rating: 4.8,
    currentLocation: "Coral Gables",
    currentJobId: "JOB-10422",
    eta: "12:05 PM",
    documentsOk: true,
    documentExpiry: "2026-11-04",
    avatarColor: "bg-emerald-500",
  },
  {
    id: "DRV-1044",
    name: "Trevon Walker",
    phone: "(305) 555-2033",
    email: "trevon.w@arsemia.co",
    vehicleId: "VEH-211",
    vehicleName: "Truck #11 - Freightliner M2 26' - 2022 - Foreman Trevon",
    status: "Available",
    jobsCompleted: 198,
    revenueHandled: 121800,
    rating: 4.7,
    currentLocation: "Doral Yard",
    documentsOk: true,
    documentExpiry: "2026-04-22",
    avatarColor: "bg-amber-500",
  },
  {
    id: "DRV-1045",
    name: "Anya Volkov",
    phone: "(305) 555-2034",
    email: "anya.v@arsemia.co",
    vehicleId: "VEH-215",
    vehicleName: "Truck #15 - Ford Transit 250 - 2023 - Foreman Anya",
    status: "On Job",
    jobsCompleted: 256,
    revenueHandled: 154300,
    rating: 4.9,
    currentLocation: "Wynwood",
    currentJobId: "JOB-10425",
    eta: "1:15 PM",
    documentsOk: true,
    documentExpiry: "2026-07-30",
    avatarColor: "bg-violet-500",
  },
  {
    id: "DRV-1046",
    name: "Jamal Carter",
    phone: "(305) 555-2035",
    email: "jamal.c@arsemia.co",
    vehicleId: "VEH-220",
    vehicleName: "Truck #20 - ISUZU NPR 26' - 2025 - Foreman Jamal",
    status: "Break",
    jobsCompleted: 410,
    revenueHandled: 241600,
    rating: 4.95,
    currentLocation: "Coral Gables",
    documentsOk: false,
    documentExpiry: "2026-05-30",
    avatarColor: "bg-rose-500",
  },
  {
    id: "DRV-1047",
    name: "Elena Park",
    phone: "(305) 555-2036",
    email: "elena.p@arsemia.co",
    vehicleId: "VEH-224",
    vehicleName: "Truck #24 - Mercedes Sprinter 144 - 2024 - Foreman Elena",
    status: "Available",
    jobsCompleted: 142,
    revenueHandled: 88200,
    rating: 4.6,
    currentLocation: "Doral",
    documentsOk: true,
    documentExpiry: "2026-09-19",
    avatarColor: "bg-cyan-500",
  },
  {
    id: "DRV-1048",
    name: "Ravi Shankar",
    phone: "(305) 555-2037",
    email: "ravi.s@arsemia.co",
    vehicleId: "VEH-230",
    vehicleName: "Truck #30 - Freightliner Cascadia 53' - 2021 - Foreman Ravi",
    status: "Offline",
    jobsCompleted: 89,
    revenueHandled: 96400,
    rating: 4.4,
    currentLocation: "Fort Lauderdale",
    documentsOk: true,
    documentExpiry: "2027-01-08",
    avatarColor: "bg-fuchsia-500",
  },
];

export const jobs: Job[] = [
{
    id: "JOB-10421",
    customer: "Sofia Martinez",
    customerPhone: "(786) 555-9975",
    pickup: "1100 Brickell Bay Dr, Miami, FL",
    delivery: "100 Andalusia Ave, Coral Gables, FL",
    pickupCity: "Brickell",
    deliveryCity: "Coral Gables",
    pickupLat: 25.7642,
    pickupLng: -80.1879,
    deliveryLat: 25.7494,
    deliveryLng: -80.258,
    type: "Local Move",
    cuFt: 752,
    miles: 4.5,
    status: "Pickup Started",
    driverId: "DRV-1042",
    driverName: "Marcus Reyes",
    crew: [
      "Marcus Reyes"
    ],
    price: 2480,
    payrollStatus: "Pending",
    scheduledAt: "2026-06-27T14:00:00",
    eta: "18:45 PM",
    zone: "Brickell",
    priority: "High",
    notes: "Elevator reserved 9–11am. Upright piano (h34 special handling).",
    bedrooms: "2BR",
    pickupBuilding: {
      type: "Apartment",
      bedrooms: "2BR",
      floor: 9,
      hasElevator: true,
      stairsFlights: 0,
      isStrict: true,
      coiRequired: true,
      coiSubmitted: true,
      parkingNotes: "Loading zone reserved",
      longCarryFeet: 0
    },
    deliveryBuilding: {
      type: "House",
      bedrooms: "2BR",
      floor: 1,
      hasElevator: false,
      stairsFlights: 1,
      isStrict: false,
      coiRequired: false,
      coiSubmitted: false,
      parkingNotes: "Driveway clear",
      longCarryFeet: 0
    },
    inventoryItems: [
      {
        name: "Sleeper Sofa / Sofa Bed",
        qty: 1,
        cuft: 60
      },
      {
        name: "Coffee Table",
        qty: 1,
        cuft: 12
      },
      {
        name: "Bookshelf (medium)",
        qty: 1,
        cuft: 12
      },
      {
        name: "Ottoman",
        qty: 1,
        cuft: 10
      },
      {
        name: "Console Table",
        qty: 1,
        cuft: 15
      },
      {
        name: "Side Table",
        qty: 1,
        cuft: 10
      },
      {
        name: "TV Stand (large)",
        qty: 1,
        cuft: 20
      },
      {
        name: "King Mattress",
        qty: 1,
        cuft: 40
      },
      {
        name: "King Bed Frame",
        qty: 1,
        cuft: 30
      },
      {
        name: "Nightstand",
        qty: 2,
        cuft: 5
      },
      {
        name: "Armoire",
        qty: 1,
        cuft: 25
      },
      {
        name: "Full Mattress",
        qty: 1,
        cuft: 25
      },
      {
        name: "Full Bed Frame",
        qty: 1,
        cuft: 20
      },
      {
        name: "Nightstand",
        qty: 2,
        cuft: 5
      },
      {
        name: "Peloton Bike",
        qty: 1,
        cuft: 25
      },
      {
        name: "Aquarium (small)",
        qty: 1,
        cuft: 8
      },
      {
        name: "Elliptical Machine",
        qty: 1,
        cuft: 30
      },
      {
        name: "Shoe Rack",
        qty: 1,
        cuft: 6
      },
      {
        name: "Trash Can",
        qty: 1,
        cuft: 5
      },
      {
        name: "Coat Rack",
        qty: 1,
        cuft: 5
      },
      {
        name: "Picture Frame XL (6ft+)",
        qty: 1,
        cuft: 15
      },
      {
        name: "Mirror (medium)",
        qty: 1,
        cuft: 10
      },
      {
        name: "TV",
        qty: 2,
        cuft: 20
      },
      {
        name: "Box (small)",
        qty: 4,
        cuft: 1.5
      },
      {
        name: "Box (medium)",
        qty: 13,
        cuft: 3,
        packByCrew: true
      },
      {
        name: "Box (large)",
        qty: 15,
        cuft: 7
      },
      {
        name: "Box (extra large)",
        qty: 6,
        cuft: 10
      },
      {
        name: "Wardrobe Box",
        qty: 5,
        cuft: 15
      },
      {
        name: "Dish Pack Box",
        qty: 2,
        cuft: 5,
        packByCrew: true
      },
      {
        name: "Suitcase (large)",
        qty: 2,
        cuft: 7
      }
    ],
    additionalServices: [
      {
      id: "svc_st_t",
      name: "Stairs at delivery (1 flight)",
      price: 35
    }
    ],
    packingByCrew: false,
    confirmations: {
      customerConfirmed: true,
      customerConfirmedAt: "2026-06-18T14:23:00",
      foremanAccepted: true,
      foremanAcceptedAt: "2026-06-19T09:10:00",
      coiSubmitted: true,
      coiSubmittedAt: "2026-06-20T11:00:00"
    }
  },
{
    id: "JOB-10422",
    customer: "Hayward Logistics LLC",
    customerPhone: "(305) 555-5706",
    pickup: "2600 W 8th Ave, Hialeah, FL",
    delivery: "50 Biscayne Blvd, Miami, FL",
    pickupCity: "Hialeah",
    deliveryCity: "Miami",
    pickupLat: 25.821,
    pickupLng: -80.2926,
    deliveryLat: 25.7762,
    deliveryLng: -80.188,
    type: "Commercial",
    cuFt: 564,
    miles: 4.5,
    status: "En Route",
    driverId: "DRV-1043",
    driverName: "Sofia Hernandez",
    crew: [
      "Sofia Hernandez"
    ],
    price: 4625,
    payrollStatus: "Pending",
    scheduledAt: "2026-06-19T13:00:00",
    eta: "15:45 PM",
    zone: "Hialeah",
    priority: "High",
    notes: "Office relocation. Loading dock reserved. 3-person crew.",
    pickupBuilding: {
      type: "House",
      floor: 1,
      hasElevator: true,
      stairsFlights: 0,
      isStrict: false,
      coiRequired: false,
      coiSubmitted: false,
      parkingNotes: "Street parking available",
      longCarryFeet: 0
    },
    deliveryBuilding: {
      type: "House",
      floor: 1,
      hasElevator: true,
      stairsFlights: 0,
      isStrict: false,
      coiRequired: false,
      coiSubmitted: false,
      parkingNotes: "Driveway clear",
      longCarryFeet: 0
    },
    inventoryItems: [
      {
        name: "Sleeper Sofa / Sofa Bed",
        qty: 1,
        cuft: 60
      },
      {
        name: "Plant (large)",
        qty: 1,
        cuft: 20
      },
      {
        name: "Console Table",
        qty: 1,
        cuft: 15
      },
      {
        name: "Entertainment Center",
        qty: 1,
        cuft: 45
      },
      {
        name: "End Table",
        qty: 1,
        cuft: 6
      },
      {
        name: "Bookshelf (medium)",
        qty: 1,
        cuft: 12
      },
      {
        name: "Recliner Chair",
        qty: 1,
        cuft: 20
      },
      {
        name: "TV Stand (small)",
        qty: 1,
        cuft: 10
      },
      {
        name: "Kitchen Table",
        qty: 1,
        cuft: 18
      },
      {
        name: "Dining Chair",
        qty: 6,
        cuft: 6
      },
      {
        name: "Queen Mattress",
        qty: 1,
        cuft: 30
      },
      {
        name: "Queen Bed Frame",
        qty: 1,
        cuft: 25
      },
      {
        name: "Nightstand",
        qty: 2,
        cuft: 5
      },
      {
        name: "Armoire",
        qty: 1,
        cuft: 25
      },
      {
        name: "Desk",
        qty: 1,
        cuft: 25
      },
      {
        name: "Desk Chair",
        qty: 1,
        cuft: 10
      },
      {
        name: "Mirror (large)",
        qty: 2,
        cuft: 15
      },
      {
        name: "Bar Cart",
        qty: 1,
        cuft: 12
      },
      {
        name: "TV",
        qty: 1,
        cuft: 20
      },
      {
        name: "Box (small)",
        qty: 5,
        cuft: 1.5
      },
      {
        name: "Box (medium)",
        qty: 8,
        cuft: 3
      },
      {
        name: "Box (large)",
        qty: 9,
        cuft: 7
      },
      {
        name: "Box (extra large)",
        qty: 2,
        cuft: 10
      },
      {
        name: "Wardrobe Box",
        qty: 1,
        cuft: 15
      },
      {
        name: "Dish Pack Box",
        qty: 1,
        cuft: 5
      }
    ],
    additionalServices: [

    ],
    packingByCrew: false,
    confirmations: {
      customerConfirmed: true,
      customerConfirmedAt: "2026-06-18T14:23:00",
      foremanAccepted: true,
      foremanAcceptedAt: "2026-06-19T09:10:00",
      coiSubmitted: false
    }
  },
{
    id: "JOB-10423",
    customer: "Olivia Chen",
    customerPhone: "(786) 555-6696",
    pickup: "1100 Brickell Bay Dr, Miami, FL",
    delivery: "5005 NW 87th Ave, Doral, FL",
    pickupCity: "Brickell",
    deliveryCity: "Doral",
    pickupLat: 25.7642,
    pickupLng: -80.1879,
    deliveryLat: 25.7912,
    deliveryLng: -80.3416,
    type: "Storage In",
    cuFt: 426,
    miles: 8.4,
    status: "Assigned",
    driverId: "DRV-1044",
    driverName: "Trevon Walker",
    crew: [
      "Trevon Walker"
    ],
    price: 1180,
    payrollStatus: "Pending",
    scheduledAt: "2026-06-29T10:00:00",
    eta: "13:45 PM",
    zone: "Brickell",
    priority: "Medium",
    notes: "Temporary storage during home renovation, 3 months estimated.",
    bedrooms: "1BR",
    pickupBuilding: {
      type: "Apartment",
      bedrooms: "1BR",
      floor: 14,
      hasElevator: true,
      stairsFlights: 0,
      isStrict: true,
      coiRequired: true,
      coiSubmitted: true,
      parkingNotes: "Loading zone reserved",
      longCarryFeet: 0
    },
    deliveryBuilding: {
      type: "House",
      bedrooms: "1BR",
      floor: 1,
      hasElevator: false,
      stairsFlights: 0,
      isStrict: false,
      coiRequired: false,
      coiSubmitted: false,
      parkingNotes: "Driveway clear",
      longCarryFeet: 0
    },
    inventoryItems: [
      {
        name: "Sleeper Sofa / Sofa Bed",
        qty: 1,
        cuft: 60
      },
      {
        name: "Side Table",
        qty: 1,
        cuft: 10
      },
      {
        name: "Arm Chair",
        qty: 1,
        cuft: 15
      },
      {
        name: "Ottoman",
        qty: 1,
        cuft: 10
      },
      {
        name: "Plant (large)",
        qty: 1,
        cuft: 20
      },
      {
        name: "Dining Table (extendable)",
        qty: 1,
        cuft: 35
      },
      {
        name: "Dining Chair",
        qty: 6,
        cuft: 6
      },
      {
        name: "Queen Mattress",
        qty: 1,
        cuft: 30
      },
      {
        name: "Queen Bed Frame",
        qty: 1,
        cuft: 25
      },
      {
        name: "Nightstand",
        qty: 2,
        cuft: 5
      },
      {
        name: "Dresser (triple)",
        qty: 1,
        cuft: 45
      },
      {
        name: "Artwork (large, crated)",
        qty: 1,
        cuft: 10
      },
      {
        name: "Bar Cart",
        qty: 1,
        cuft: 12
      },
      {
        name: "TV",
        qty: 1,
        cuft: 20
      },
      {
        name: "Box (small)",
        qty: 1,
        cuft: 1.5
      },
      {
        name: "Box (medium)",
        qty: 7,
        cuft: 3
      },
      {
        name: "Box (large)",
        qty: 4,
        cuft: 7
      },
      {
        name: "Box (extra large)",
        qty: 1,
        cuft: 10
      },
      {
        name: "Suitcase (large)",
        qty: 4,
        cuft: 7
      }
    ],
    additionalServices: [

    ],
    packingByCrew: false,
    confirmations: {
      customerConfirmed: true,
      customerConfirmedAt: "2026-06-18T14:23:00",
      foremanAccepted: true,
      foremanAcceptedAt: "2026-06-19T09:10:00",
      coiSubmitted: true,
      coiSubmittedAt: "2026-06-20T11:00:00"
    }
  },
{
    id: "JOB-10424",
    customer: "Marcus Thompson",
    customerPhone: "(786) 555-5712",
    pickup: "2900 Bayshore Dr, Coconut Grove, FL",
    delivery: "11500 SW 57th Ave, Pinecrest, FL",
    pickupCity: "Coconut Grove",
    deliveryCity: "Pinecrest",
    pickupLat: 25.7271,
    pickupLng: -80.2354,
    deliveryLat: 25.6712,
    deliveryLng: -80.3013,
    type: "Local Move",
    cuFt: 1468,
    miles: 4.5,
    status: "Assigned",
    driverId: "DRV-1042",
    driverName: "Marcus Reyes",
    crew: [
      "Marcus Reyes"
    ],
    price: 3580,
    payrollStatus: "Pending",
    scheduledAt: "2026-06-30T10:00:00",
    eta: "13:15 PM",
    zone: "Coconut Grove",
    priority: "Medium",
    notes: "House to house. Family with young kids. Crew packs kitchen + nursery.",
    bedrooms: "3BR",
    pickupBuilding: {
      type: "House",
      bedrooms: "3BR",
      floor: 1,
      hasElevator: false,
      stairsFlights: 2,
      isStrict: false,
      coiRequired: false,
      coiSubmitted: false,
      parkingNotes: "Street parking available",
      longCarryFeet: 80
    },
    deliveryBuilding: {
      type: "House",
      bedrooms: "3BR",
      floor: 1,
      hasElevator: false,
      stairsFlights: 0,
      isStrict: false,
      coiRequired: false,
      coiSubmitted: false,
      parkingNotes: "Driveway clear",
      longCarryFeet: 0
    },
    inventoryItems: [
      {
        name: "Sleeper Sofa / Sofa Bed",
        qty: 1,
        cuft: 60
      },
      {
        name: "Accent Chair",
        qty: 1,
        cuft: 12
      },
      {
        name: "Rug",
        qty: 1,
        cuft: 15
      },
      {
        name: "Entertainment Center",
        qty: 1,
        cuft: 45
      },
      {
        name: "Lamp (table)",
        qty: 1,
        cuft: 3
      },
      {
        name: "TV Stand (small)",
        qty: 1,
        cuft: 10
      },
      {
        name: "Ottoman",
        qty: 1,
        cuft: 10
      },
      {
        name: "Side Table",
        qty: 1,
        cuft: 10
      },
      {
        name: "Dining Table (large)",
        qty: 1,
        cuft: 30
      },
      {
        name: "Dining Chair",
        qty: 4,
        cuft: 6
      },
      {
        name: "Queen Mattress",
        qty: 1,
        cuft: 30
      },
      {
        name: "Queen Bed Frame",
        qty: 1,
        cuft: 25
      },
      {
        name: "Nightstand",
        qty: 2,
        cuft: 5
      },
      {
        name: "Armoire",
        qty: 1,
        cuft: 25
      },
      {
        name: "Bunk Bed",
        qty: 1,
        cuft: 50
      },
      {
        name: "Dresser (single)",
        qty: 1,
        cuft: 25
      },
      {
        name: "Crib",
        qty: 1,
        cuft: 18
      },
      {
        name: "Twin Mattress",
        qty: 1,
        cuft: 20
      },
      {
        name: "Twin Bed Frame",
        qty: 1,
        cuft: 15
      },
      {
        name: "Dresser (single)",
        qty: 1,
        cuft: 25
      },
      {
        name: "Standing Desk",
        qty: 1,
        cuft: 30
      },
      {
        name: "Desk Chair",
        qty: 1,
        cuft: 10
      },
      {
        name: "Piano (upright)",
        qty: 1,
        cuft: 80
      },
      {
        name: "Aquarium (small)",
        qty: 1,
        cuft: 8
      },
      {
        name: "Picture Frame XL (6ft+)",
        qty: 1,
        cuft: 15
      },
      {
        name: "Mirror (medium)",
        qty: 2,
        cuft: 10
      },
      {
        name: "Shoe Rack",
        qty: 1,
        cuft: 6
      },
      {
        name: "Patio Umbrella",
        qty: 1,
        cuft: 5
      },
      {
        name: "Patio Chair",
        qty: 4,
        cuft: 8
      },
      {
        name: "TV",
        qty: 1,
        cuft: 20
      },
      {
        name: "TV Box (43\"-65\")",
        qty: 2,
        cuft: 50
      },
      {
        name: "Box (small)",
        qty: 20,
        cuft: 1.5,
        packByCrew: true
      },
      {
        name: "Box (medium)",
        qty: 54,
        cuft: 3
      },
      {
        name: "Box (large)",
        qty: 22,
        cuft: 7,
        packByCrew: true
      },
      {
        name: "Box (extra large)",
        qty: 16,
        cuft: 10,
        packByCrew: true
      },
      {
        name: "Wardrobe Box",
        qty: 8,
        cuft: 15,
        packByCrew: true
      },
      {
        name: "Dish Pack Box",
        qty: 8,
        cuft: 5
      },
      {
        name: "Suitcase (large)",
        qty: 2,
        cuft: 7
      }
    ],
    additionalServices: [
      {
      id: "svc_st_f",
      name: "Stairs at pickup (2 flights)",
      price: 70
    },
      {
      id: "svc_lc",
      name: "Long carry",
      price: 75
    },
      {
      id: "svc_pk",
      name: "Crew packing service",
      price: 480
    }
    ],
    packingByCrew: true,
    confirmations: {
      customerConfirmed: true,
      customerConfirmedAt: "2026-06-18T14:23:00",
      foremanAccepted: true,
      foremanAcceptedAt: "2026-06-19T09:10:00",
      coiSubmitted: false
    }
  },
{
    id: "JOB-10425",
    customer: "Aiden Vasquez",
    customerPhone: "(305) 555-7533",
    pickup: "350 NW 24th St, Miami, FL",
    delivery: "1300 Brickell Bay Dr, Miami, FL",
    pickupCity: "Wynwood",
    deliveryCity: "Brickell",
    pickupLat: 25.7998,
    pickupLng: -80.197,
    deliveryLat: 25.7619,
    deliveryLng: -80.1885,
    type: "Local Move",
    cuFt: 360,
    miles: 14.6,
    status: "Pickup Completed",
    driverId: "DRV-1045",
    driverName: "Anya Volkov",
    crew: [
      "Anya Volkov"
    ],
    price: 820,
    payrollStatus: "Pending",
    scheduledAt: "2026-06-30T10:00:00",
    eta: "14:45 PM",
    zone: "Wynwood",
    priority: "Low",
    notes: "Studio to studio. COI submitted to new building.",
    bedrooms: "Studio",
    pickupBuilding: {
      type: "Apartment",
      bedrooms: "Studio",
      floor: 16,
      hasElevator: true,
      stairsFlights: 0,
      isStrict: false,
      coiRequired: true,
      coiSubmitted: true,
      parkingNotes: "Street parking available",
      longCarryFeet: 0
    },
    deliveryBuilding: {
      type: "Apartment",
      bedrooms: "Studio",
      floor: 15,
      hasElevator: true,
      stairsFlights: 0,
      isStrict: false,
      coiRequired: false,
      coiSubmitted: false,
      parkingNotes: "Service elevator booked",
      longCarryFeet: 0
    },
    inventoryItems: [
      {
        name: "Sofa (2-seater)",
        qty: 1,
        cuft: 35
      },
      {
        name: "Lamp (floor)",
        qty: 1,
        cuft: 8
      },
      {
        name: "Arm Chair",
        qty: 1,
        cuft: 15
      },
      {
        name: "Lamp (table)",
        qty: 1,
        cuft: 3
      },
      {
        name: "Coffee Table",
        qty: 1,
        cuft: 12
      },
      {
        name: "Bar Stool",
        qty: 4,
        cuft: 4
      },
      {
        name: "Full Mattress",
        qty: 1,
        cuft: 25
      },
      {
        name: "Full Bed Frame",
        qty: 1,
        cuft: 20
      },
      {
        name: "Nightstand",
        qty: 1,
        cuft: 5
      },
      {
        name: "Armoire",
        qty: 1,
        cuft: 25
      },
      {
        name: "Standing Desk",
        qty: 1,
        cuft: 30
      },
      {
        name: "Desk Chair",
        qty: 1,
        cuft: 10
      },
      {
        name: "Refrigerator (French door)",
        qty: 1,
        cuft: 50
      },
      {
        name: "Washer",
        qty: 1,
        cuft: 30
      },
      {
        name: "Trash Can",
        qty: 1,
        cuft: 5
      },
      {
        name: "TV",
        qty: 1,
        cuft: 20
      },
      {
        name: "Box (small)",
        qty: 2,
        cuft: 1.5
      },
      {
        name: "Box (medium)",
        qty: 1,
        cuft: 3
      },
      {
        name: "Box (large)",
        qty: 2,
        cuft: 7
      },
      {
        name: "Box (extra large)",
        qty: 1,
        cuft: 10
      },
      {
        name: "Suitcase (large)",
        qty: 3,
        cuft: 7
      }
    ],
    additionalServices: [

    ],
    packingByCrew: false,
    confirmations: {
      customerConfirmed: true,
      customerConfirmedAt: "2026-06-18T14:23:00",
      foremanAccepted: true,
      foremanAcceptedAt: "2026-06-19T09:10:00",
      coiSubmitted: true,
      coiSubmittedAt: "2026-06-20T11:00:00"
    }
  },
{
    id: "JOB-10426",
    customer: "Isabella Fernandez",
    customerPhone: "(786) 555-8851",
    pickup: "11800 SW 67th Ave, Pinecrest, FL",
    delivery: "5800 N Florida Ave, Tampa, FL",
    pickupCity: "Pinecrest",
    deliveryCity: "Tampa",
    pickupLat: 25.6643,
    pickupLng: -80.3149,
    deliveryLat: 28.0042,
    deliveryLng: -82.4585,
    type: "Long Distance",
    cuFt: 1127,
    miles: 264,
    status: "Assigned",
    driverId: "DRV-1048",
    driverName: "Ravi Shankar",
    crew: [
      "Ravi Shankar"
    ],
    price: 8950,
    payrollStatus: "Pending",
    scheduledAt: "2026-06-26T11:00:00",
    eta: "15:00 PM",
    zone: "Tampa, FL",
    priority: "High",
    notes: "Family relocating for new job. Full pack + LD. Driver overnight in Tampa.",
    bedrooms: "3BR",
    pickupBuilding: {
      type: "House",
      bedrooms: "3BR",
      floor: 1,
      hasElevator: false,
      stairsFlights: 0,
      isStrict: false,
      coiRequired: false,
      coiSubmitted: false,
      parkingNotes: "Street parking available",
      longCarryFeet: 80
    },
    deliveryBuilding: {
      type: "House",
      bedrooms: "3BR",
      floor: 1,
      hasElevator: false,
      stairsFlights: 0,
      isStrict: false,
      coiRequired: false,
      coiSubmitted: false,
      parkingNotes: "Driveway clear",
      longCarryFeet: 0
    },
    inventoryItems: [
      {
        name: "Sofa (3-seater)",
        qty: 1,
        cuft: 50
      },
      {
        name: "Ottoman",
        qty: 1,
        cuft: 10
      },
      {
        name: "Side Table",
        qty: 1,
        cuft: 10
      },
      {
        name: "Rug (large)",
        qty: 1,
        cuft: 25
      },
      {
        name: "TV Stand (large)",
        qty: 1,
        cuft: 20
      },
      {
        name: "Plant (large)",
        qty: 1,
        cuft: 20
      },
      {
        name: "End Table",
        qty: 1,
        cuft: 6
      },
      {
        name: "Kitchen Table",
        qty: 1,
        cuft: 18
      },
      {
        name: "Dining Chair",
        qty: 4,
        cuft: 6
      },
      {
        name: "Queen Mattress",
        qty: 1,
        cuft: 30
      },
      {
        name: "Queen Bed Frame",
        qty: 1,
        cuft: 25
      },
      {
        name: "Nightstand",
        qty: 2,
        cuft: 5
      },
      {
        name: "Chest of Drawers",
        qty: 1,
        cuft: 30
      },
      {
        name: "Twin Mattress",
        qty: 1,
        cuft: 20
      },
      {
        name: "Twin Bed Frame",
        qty: 1,
        cuft: 15
      },
      {
        name: "Dresser (single)",
        qty: 1,
        cuft: 25
      },
      {
        name: "Twin Mattress",
        qty: 1,
        cuft: 20
      },
      {
        name: "Twin Bed Frame",
        qty: 1,
        cuft: 15
      },
      {
        name: "Dresser (single)",
        qty: 1,
        cuft: 25
      },
      {
        name: "Pool Table",
        qty: 1,
        cuft: 80
      },
      {
        name: "Gun Safe (large)",
        qty: 1,
        cuft: 45
      },
      {
        name: "Artwork (large, crated)",
        qty: 1,
        cuft: 10
      },
      {
        name: "Picture Frame XL (6ft+)",
        qty: 1,
        cuft: 15
      },
      {
        name: "Trash Can",
        qty: 1,
        cuft: 5
      },
      {
        name: "Bar Cart",
        qty: 1,
        cuft: 12
      },
      {
        name: "Kitchen Cart",
        qty: 1,
        cuft: 15
      },
      {
        name: "Patio Chair",
        qty: 2,
        cuft: 8
      },
      {
        name: "Patio Lounge Chair",
        qty: 1,
        cuft: 18
      },
      {
        name: "TV",
        qty: 1,
        cuft: 20
      },
      {
        name: "TV Box (43\"-65\")",
        qty: 2,
        cuft: 50
      },
      {
        name: "Box (small)",
        qty: 26,
        cuft: 1.5,
        packByCrew: true
      },
      {
        name: "Box (medium)",
        qty: 51,
        cuft: 3
      },
      {
        name: "Box (large)",
        qty: 15,
        cuft: 7
      },
      {
        name: "Box (extra large)",
        qty: 7,
        cuft: 10
      },
      {
        name: "Dish Pack Box",
        qty: 1,
        cuft: 5
      },
      {
        name: "Suitcase (large)",
        qty: 3,
        cuft: 7
      }
    ],
    additionalServices: [
      {
      id: "svc_lc",
      name: "Long carry",
      price: 75
    },
      {
      id: "svc_pk",
      name: "Crew packing service",
      price: 480
    }
    ],
    packingByCrew: true,
    confirmations: {
      customerConfirmed: true,
      customerConfirmedAt: "2026-06-18T14:23:00",
      foremanAccepted: true,
      foremanAcceptedAt: "2026-06-19T09:10:00",
      coiSubmitted: false
    }
  },
{
    id: "JOB-10427",
    customer: "Mia Patel",
    customerPhone: "(305) 555-8898",
    pickup: "5333 Collins Ave, Miami Beach, FL",
    delivery: "19501 Biscayne Blvd, Aventura, FL",
    pickupCity: "Miami Beach",
    deliveryCity: "Aventura",
    pickupLat: 25.8211,
    pickupLng: -80.1271,
    deliveryLat: 25.9555,
    deliveryLng: -80.1432,
    type: "Local Move",
    cuFt: 706,
    miles: 4.5,
    status: "En Route",
    driverId: "DRV-1047",
    driverName: "Elena Park",
    crew: [
      "Elena Park"
    ],
    price: 1640,
    payrollStatus: "Pending",
    scheduledAt: "2026-06-30T13:00:00",
    eta: "15:00 PM",
    zone: "Miami Beach",
    priority: "Medium",
    notes: "Both buildings require COI. Submitted yesterday, confirmed.",
    bedrooms: "1BR",
    pickupBuilding: {
      type: "Apartment",
      bedrooms: "1BR",
      floor: 15,
      hasElevator: true,
      stairsFlights: 0,
      isStrict: true,
      coiRequired: true,
      coiSubmitted: true,
      parkingNotes: "Loading zone reserved",
      longCarryFeet: 0
    },
    deliveryBuilding: {
      type: "Apartment",
      bedrooms: "1BR",
      floor: 17,
      hasElevator: true,
      stairsFlights: 0,
      isStrict: false,
      coiRequired: false,
      coiSubmitted: false,
      parkingNotes: "Service elevator booked",
      longCarryFeet: 0
    },
    inventoryItems: [
      {
        name: "Sleeper Sofa / Sofa Bed",
        qty: 1,
        cuft: 60
      },
      {
        name: "Accent Chair",
        qty: 1,
        cuft: 12
      },
      {
        name: "Recliner Chair",
        qty: 1,
        cuft: 20
      },
      {
        name: "Rug",
        qty: 1,
        cuft: 15
      },
      {
        name: "Console Table",
        qty: 1,
        cuft: 15
      },
      {
        name: "Entertainment Center",
        qty: 1,
        cuft: 45
      },
      {
        name: "Ottoman",
        qty: 1,
        cuft: 10
      },
      {
        name: "Plant (large)",
        qty: 1,
        cuft: 20
      },
      {
        name: "Dining Table (small)",
        qty: 1,
        cuft: 20
      },
      {
        name: "Dining Chair",
        qty: 4,
        cuft: 6
      },
      {
        name: "Queen Mattress",
        qty: 1,
        cuft: 30
      },
      {
        name: "Queen Bed Frame",
        qty: 1,
        cuft: 25
      },
      {
        name: "Nightstand",
        qty: 2,
        cuft: 5
      },
      {
        name: "Dresser (single)",
        qty: 1,
        cuft: 25
      },
      {
        name: "Standing Desk",
        qty: 1,
        cuft: 30
      },
      {
        name: "Desk Chair",
        qty: 1,
        cuft: 10
      },
      {
        name: "Dishwasher",
        qty: 1,
        cuft: 25
      },
      {
        name: "Microwave",
        qty: 1,
        cuft: 5
      },
      {
        name: "Refrigerator (standard)",
        qty: 1,
        cuft: 40
      },
      {
        name: "Mini Fridge",
        qty: 1,
        cuft: 15
      },
      {
        name: "Treadmill",
        qty: 1,
        cuft: 35
      },
      {
        name: "Picture Frame XL (6ft+)",
        qty: 1,
        cuft: 15
      },
      {
        name: "Shoe Rack",
        qty: 1,
        cuft: 6
      },
      {
        name: "Artwork (large, crated)",
        qty: 1,
        cuft: 10
      },
      {
        name: "Bar Cart",
        qty: 1,
        cuft: 12
      },
      {
        name: "TV",
        qty: 1,
        cuft: 20
      },
      {
        name: "Box (small)",
        qty: 5,
        cuft: 1.5
      },
      {
        name: "Box (medium)",
        qty: 8,
        cuft: 3
      },
      {
        name: "Box (large)",
        qty: 10,
        cuft: 7
      },
      {
        name: "Box (extra large)",
        qty: 3,
        cuft: 10
      },
      {
        name: "Wardrobe Box",
        qty: 1,
        cuft: 15
      },
      {
        name: "Dish Pack Box",
        qty: 1,
        cuft: 5
      }
    ],
    additionalServices: [

    ],
    packingByCrew: false,
    confirmations: {
      customerConfirmed: true,
      customerConfirmedAt: "2026-06-18T14:23:00",
      foremanAccepted: true,
      foremanAcceptedAt: "2026-06-19T09:10:00",
      coiSubmitted: true,
      coiSubmittedAt: "2026-06-20T11:00:00"
    }
  },
{
    id: "JOB-10428",
    customer: "Layla Khoury",
    customerPhone: "(786) 555-6040",
    pickup: "2900 Bayshore Dr, Coconut Grove, FL",
    delivery: "2900 Bayshore Dr, Coconut Grove, FL",
    pickupCity: "Coconut Grove",
    deliveryCity: "Coconut Grove",
    pickupLat: 25.7271,
    pickupLng: -80.2354,
    deliveryLat: 25.7271,
    deliveryLng: -80.2354,
    type: "Hourly",
    cuFt: 66,
    miles: 11.2,
    status: "Unassigned",
    crew: [

    ],
    price: 540,
    payrollStatus: "Pending",
    scheduledAt: "2026-06-29T11:00:00",
    zone: "Coconut Grove",
    priority: "Low",
    notes: "Hourly @ $135/hr. Estimated 4 hrs. Within-neighborhood reposition.",
    pickupBuilding: {
      type: "House",
      floor: 1,
      hasElevator: false,
      stairsFlights: 1,
      isStrict: false,
      coiRequired: false,
      coiSubmitted: false,
      parkingNotes: "Street parking available",
      longCarryFeet: 80
    },
    deliveryBuilding: {
      type: "House",
      floor: 1,
      hasElevator: false,
      stairsFlights: 1,
      isStrict: false,
      coiRequired: false,
      coiSubmitted: false,
      parkingNotes: "Driveway clear",
      longCarryFeet: 0
    },
    inventoryItems: [
      {
        name: "Ottoman",
        qty: 1,
        cuft: 10
      },
      {
        name: "Side Table",
        qty: 1,
        cuft: 10
      },
      {
        name: "Lamp (table)",
        qty: 1,
        cuft: 3
      },
      {
        name: "Box (small)",
        qty: 1,
        cuft: 1.5
      },
      {
        name: "Box (medium)",
        qty: 2,
        cuft: 3
      },
      {
        name: "Box (large)",
        qty: 5,
        cuft: 7
      }
    ],
    additionalServices: [
      {
      id: "svc_st_f",
      name: "Stairs at pickup (1 flight)",
      price: 35
    },
      {
      id: "svc_st_t",
      name: "Stairs at delivery (1 flight)",
      price: 35
    },
      {
      id: "svc_lc",
      name: "Long carry",
      price: 75
    }
    ],
    packingByCrew: false,
    confirmations: {
      customerConfirmed: true,
      customerConfirmedAt: "2026-06-18T14:23:00",
      foremanAccepted: false,
      coiSubmitted: false
    },
    hours: 4,
    hourlyRate: 135
  },
{
    id: "JOB-10429",
    customer: "Lucas Beltran",
    customerPhone: "(305) 555-3455",
    pickup: "4400 Ponce de Leon Blvd, Coral Gables, FL",
    delivery: "7575 SW 124th St, Pinecrest, FL",
    pickupCity: "Coral Gables",
    deliveryCity: "Pinecrest",
    pickupLat: 25.7384,
    pickupLng: -80.2599,
    deliveryLat: 25.6502,
    deliveryLng: -80.3287,
    type: "Local Move",
    cuFt: 1394,
    miles: 3.2,
    status: "Assigned",
    driverId: "DRV-1046",
    driverName: "Jamal Carter",
    crew: [
      "Jamal Carter"
    ],
    price: 5820,
    payrollStatus: "Pending",
    scheduledAt: "2026-06-23T10:00:00",
    eta: "14:45 PM",
    zone: "Coral Gables",
    priority: "High",
    notes: "Large family home. Heavy items (pool table, baby grand piano). Crew of 4.",
    bedrooms: "4BR",
    pickupBuilding: {
      type: "House",
      bedrooms: "4BR",
      floor: 1,
      hasElevator: false,
      stairsFlights: 1,
      isStrict: false,
      coiRequired: false,
      coiSubmitted: false,
      parkingNotes: "Street parking available",
      longCarryFeet: 0
    },
    deliveryBuilding: {
      type: "House",
      bedrooms: "4BR",
      floor: 1,
      hasElevator: false,
      stairsFlights: 0,
      isStrict: false,
      coiRequired: false,
      coiSubmitted: false,
      parkingNotes: "Driveway clear",
      longCarryFeet: 0
    },
    inventoryItems: [
      {
        name: "Sofa (3-seater)",
        qty: 1,
        cuft: 50
      },
      {
        name: "Rug",
        qty: 1,
        cuft: 15
      },
      {
        name: "Plant (large)",
        qty: 1,
        cuft: 20
      },
      {
        name: "Accent Chair",
        qty: 1,
        cuft: 12
      },
      {
        name: "Lamp (floor)",
        qty: 1,
        cuft: 8
      },
      {
        name: "Rug (large)",
        qty: 1,
        cuft: 25
      },
      {
        name: "Coffee Table",
        qty: 1,
        cuft: 12
      },
      {
        name: "Side Table",
        qty: 1,
        cuft: 10
      },
      {
        name: "Dining Table (extendable)",
        qty: 1,
        cuft: 35
      },
      {
        name: "Dining Chair",
        qty: 4,
        cuft: 6
      },
      {
        name: "King Mattress",
        qty: 1,
        cuft: 40
      },
      {
        name: "King Bed Frame",
        qty: 1,
        cuft: 30
      },
      {
        name: "Nightstand",
        qty: 2,
        cuft: 5
      },
      {
        name: "Chest of Drawers",
        qty: 1,
        cuft: 30
      },
      {
        name: "Twin Mattress",
        qty: 1,
        cuft: 20
      },
      {
        name: "Twin Bed Frame",
        qty: 1,
        cuft: 15
      },
      {
        name: "Nightstand",
        qty: 2,
        cuft: 5
      },
      {
        name: "Twin Mattress",
        qty: 1,
        cuft: 20
      },
      {
        name: "Twin Bed Frame",
        qty: 1,
        cuft: 15
      },
      {
        name: "Nightstand",
        qty: 1,
        cuft: 5
      },
      {
        name: "Full Mattress",
        qty: 1,
        cuft: 25
      },
      {
        name: "Full Bed Frame",
        qty: 1,
        cuft: 20
      },
      {
        name: "Nightstand",
        qty: 1,
        cuft: 5
      },
      {
        name: "Dresser (triple)",
        qty: 1,
        cuft: 45
      },
      {
        name: "Treadmill",
        qty: 1,
        cuft: 35
      },
      {
        name: "Aquarium (large)",
        qty: 1,
        cuft: 25
      },
      {
        name: "Foosball Table",
        qty: 1,
        cuft: 25
      },
      {
        name: "Coat Rack",
        qty: 1,
        cuft: 5
      },
      {
        name: "Trash Can",
        qty: 1,
        cuft: 5
      },
      {
        name: "Mirror (large)",
        qty: 1,
        cuft: 15
      },
      {
        name: "Mirror (medium)",
        qty: 1,
        cuft: 10
      },
      {
        name: "Artwork (large, crated)",
        qty: 1,
        cuft: 10
      },
      {
        name: "Wine Rack",
        qty: 1,
        cuft: 8
      },
      {
        name: "Plant (large)",
        qty: 1,
        cuft: 20
      },
      {
        name: "Patio Table",
        qty: 1,
        cuft: 25
      },
      {
        name: "TV",
        qty: 1,
        cuft: 20
      },
      {
        name: "TV Box (43\"-65\")",
        qty: 3,
        cuft: 50
      },
      {
        name: "Box (small)",
        qty: 26,
        cuft: 1.5
      },
      {
        name: "Box (medium)",
        qty: 54,
        cuft: 3
      },
      {
        name: "Box (large)",
        qty: 9,
        cuft: 7,
        packByCrew: true
      },
      {
        name: "Box (extra large)",
        qty: 2,
        cuft: 10
      },
      {
        name: "Wardrobe Box",
        qty: 13,
        cuft: 15
      },
      {
        name: "Dish Pack Box",
        qty: 8,
        cuft: 5
      },
      {
        name: "Suitcase (large)",
        qty: 3,
        cuft: 7
      }
    ],
    additionalServices: [
      {
      id: "svc_st_f",
      name: "Stairs at pickup (1 flight)",
      price: 35
    },
      {
      id: "svc_pk",
      name: "Crew packing service",
      price: 480
    }
    ],
    packingByCrew: true,
    confirmations: {
      customerConfirmed: true,
      customerConfirmedAt: "2026-06-18T14:23:00",
      foremanAccepted: true,
      foremanAcceptedAt: "2026-06-19T09:10:00",
      coiSubmitted: false
    }
  },
{
    id: "JOB-10430",
    customer: "Camila Lopez",
    customerPhone: "(786) 555-8114",
    pickup: "2 SW 10th St, Miami, FL",
    delivery: "1300 Brickell Bay Dr, Miami, FL",
    pickupCity: "Brickell",
    deliveryCity: "Brickell",
    pickupLat: 25.7689,
    pickupLng: -80.1937,
    deliveryLat: 25.7619,
    deliveryLng: -80.1885,
    type: "Packing Only",
    cuFt: 182,
    miles: 22.1,
    status: "Assigned",
    driverId: "DRV-1043",
    driverName: "Sofia Hernandez",
    crew: [
      "Sofia Hernandez"
    ],
    price: 980,
    payrollStatus: "Pending",
    scheduledAt: "2026-06-23T14:00:00",
    eta: "18:00 PM",
    zone: "Brickell",
    priority: "Medium",
    notes: "Packing-only service. Move is next week with another company. 30 boxes estimated.",
    bedrooms: "2BR",
    pickupBuilding: {
      type: "Apartment",
      bedrooms: "2BR",
      floor: 16,
      hasElevator: true,
      stairsFlights: 0,
      isStrict: true,
      coiRequired: false,
      coiSubmitted: false,
      parkingNotes: "Loading zone reserved",
      longCarryFeet: 0
    },
    deliveryBuilding: {
      type: "Apartment",
      bedrooms: "2BR",
      floor: 18,
      hasElevator: true,
      stairsFlights: 0,
      isStrict: false,
      coiRequired: false,
      coiSubmitted: false,
      parkingNotes: "Service elevator booked",
      longCarryFeet: 0
    },
    inventoryItems: [
      {
        name: "Box (small)",
        qty: 3,
        cuft: 1.5,
        packByCrew: true
      },
      {
        name: "Box (medium)",
        qty: 5,
        cuft: 3,
        packByCrew: true
      },
      {
        name: "Box (large)",
        qty: 9,
        cuft: 7,
        packByCrew: true
      },
      {
        name: "Box (extra large)",
        qty: 4,
        cuft: 10,
        packByCrew: true
      },
      {
        name: "Wardrobe Box",
        qty: 4,
        cuft: 15,
        packByCrew: true
      }
    ],
    additionalServices: [
      {
      id: "svc_pk",
      name: "Crew packing service",
      price: 480
    }
    ],
    packingByCrew: true,
    confirmations: {
      customerConfirmed: true,
      customerConfirmedAt: "2026-06-18T14:23:00",
      foremanAccepted: true,
      foremanAcceptedAt: "2026-06-19T09:10:00",
      coiSubmitted: false
    }
  },
{
    id: "JOB-10431",
    customer: "Aronson Design Studio",
    customerPhone: "(786) 555-3999",
    pickup: "2520 NW 2nd Ave, Miami, FL",
    delivery: "401 SE 17th St, Fort Lauderdale, FL",
    pickupCity: "Wynwood",
    deliveryCity: "Fort Lauderdale",
    pickupLat: 25.8013,
    pickupLng: -80.1939,
    deliveryLat: 26.0987,
    deliveryLng: -80.1325,
    type: "Long Distance",
    cuFt: 471,
    miles: 31,
    status: "Unassigned",
    crew: [

    ],
    price: 4720,
    payrollStatus: "Pending",
    scheduledAt: "2026-06-26T14:00:00",
    zone: "Fort Lauderdale",
    priority: "High",
    notes: "Boutique office relocation. Art crating required. COI to delivery building.",
    pickupBuilding: {
      type: "Commercial",
      floor: 1,
      hasElevator: true,
      stairsFlights: 0,
      isStrict: false,
      coiRequired: true,
      coiSubmitted: true,
      parkingNotes: "Street parking available",
      longCarryFeet: 0
    },
    deliveryBuilding: {
      type: "Commercial",
      floor: 1,
      hasElevator: true,
      stairsFlights: 0,
      isStrict: false,
      coiRequired: false,
      coiSubmitted: false,
      parkingNotes: "Driveway clear",
      longCarryFeet: 0
    },
    inventoryItems: [
      {
        name: "Sofa (2-seater)",
        qty: 1,
        cuft: 35
      },
      {
        name: "Accent Chair",
        qty: 1,
        cuft: 12
      },
      {
        name: "Rug (large)",
        qty: 1,
        cuft: 25
      },
      {
        name: "Bookshelf (medium)",
        qty: 1,
        cuft: 12
      },
      {
        name: "Side Table",
        qty: 1,
        cuft: 10
      },
      {
        name: "Arm Chair",
        qty: 1,
        cuft: 15
      },
      {
        name: "End Table",
        qty: 1,
        cuft: 6
      },
      {
        name: "Console Table",
        qty: 1,
        cuft: 15
      },
      {
        name: "Lamp (floor)",
        qty: 1,
        cuft: 8
      },
      {
        name: "Dining Table (large)",
        qty: 1,
        cuft: 30
      },
      {
        name: "Dining Chair",
        qty: 4,
        cuft: 6
      },
      {
        name: "Queen Mattress",
        qty: 1,
        cuft: 30
      },
      {
        name: "Queen Bed Frame",
        qty: 1,
        cuft: 25
      },
      {
        name: "Nightstand",
        qty: 2,
        cuft: 5
      },
      {
        name: "Chest of Drawers",
        qty: 1,
        cuft: 30
      },
      {
        name: "Standing Desk",
        qty: 1,
        cuft: 30
      },
      {
        name: "Desk Chair",
        qty: 1,
        cuft: 10
      },
      {
        name: "Microwave",
        qty: 1,
        cuft: 5
      },
      {
        name: "Trash Can",
        qty: 1,
        cuft: 5
      },
      {
        name: "Bar Cart",
        qty: 1,
        cuft: 12
      },
      {
        name: "TV",
        qty: 1,
        cuft: 20
      },
      {
        name: "Box (small)",
        qty: 4,
        cuft: 1.5
      },
      {
        name: "Box (medium)",
        qty: 5,
        cuft: 3
      },
      {
        name: "Box (large)",
        qty: 3,
        cuft: 7
      },
      {
        name: "Box (extra large)",
        qty: 4,
        cuft: 10
      },
      {
        name: "Wardrobe Box",
        qty: 1,
        cuft: 15
      },
      {
        name: "Dish Pack Box",
        qty: 1,
        cuft: 5
      }
    ],
    additionalServices: [

    ],
    packingByCrew: false,
    confirmations: {
      customerConfirmed: true,
      customerConfirmedAt: "2026-06-18T14:23:00",
      foremanAccepted: false,
      coiSubmitted: true,
      coiSubmittedAt: "2026-06-20T11:00:00"
    }
  },
{
    id: "JOB-10432",
    customer: "Ethan Park",
    customerPhone: "(305) 555-7738",
    pickup: "21100 Point Pl, Aventura, FL",
    delivery: "13800 NE 6th Ave, North Miami, FL",
    pickupCity: "Aventura",
    deliveryCity: "North Miami",
    pickupLat: 25.9627,
    pickupLng: -80.1304,
    deliveryLat: 25.9069,
    deliveryLng: -80.1872,
    type: "Local Move",
    cuFt: 719,
    miles: 22.1,
    status: "Completed",
    driverId: "DRV-1044",
    driverName: "Trevon Walker",
    crew: [
      "Trevon Walker"
    ],
    price: 2180,
    payrollStatus: "Paid",
    scheduledAt: "2026-06-29T10:00:00",
    zone: "Aventura",
    priority: "Medium",
    notes: "Completed Saturday. Both buildings strict; COI cleared smoothly.",
    bedrooms: "2BR",
    pickupBuilding: {
      type: "Apartment",
      bedrooms: "2BR",
      floor: 13,
      hasElevator: true,
      stairsFlights: 0,
      isStrict: true,
      coiRequired: true,
      coiSubmitted: true,
      parkingNotes: "Loading zone reserved",
      longCarryFeet: 0
    },
    deliveryBuilding: {
      type: "Apartment",
      bedrooms: "2BR",
      floor: 5,
      hasElevator: true,
      stairsFlights: 0,
      isStrict: false,
      coiRequired: false,
      coiSubmitted: false,
      parkingNotes: "Service elevator booked",
      longCarryFeet: 0
    },
    inventoryItems: [
      {
        name: "Sofa (3-seater)",
        qty: 1,
        cuft: 50
      },
      {
        name: "Accent Chair",
        qty: 1,
        cuft: 12
      },
      {
        name: "Bookshelf (medium)",
        qty: 1,
        cuft: 12
      },
      {
        name: "Rug",
        qty: 1,
        cuft: 15
      },
      {
        name: "Recliner Chair",
        qty: 1,
        cuft: 20
      },
      {
        name: "Lamp (floor)",
        qty: 1,
        cuft: 8
      },
      {
        name: "Coffee Table",
        qty: 1,
        cuft: 12
      },
      {
        name: "King Mattress",
        qty: 1,
        cuft: 40
      },
      {
        name: "King Bed Frame",
        qty: 1,
        cuft: 30
      },
      {
        name: "Nightstand",
        qty: 2,
        cuft: 5
      },
      {
        name: "Dresser (triple)",
        qty: 1,
        cuft: 45
      },
      {
        name: "Full Mattress",
        qty: 1,
        cuft: 25
      },
      {
        name: "Full Bed Frame",
        qty: 1,
        cuft: 20
      },
      {
        name: "Nightstand",
        qty: 1,
        cuft: 5
      },
      {
        name: "Microwave",
        qty: 1,
        cuft: 5
      },
      {
        name: "Dryer",
        qty: 1,
        cuft: 30
      },
      {
        name: "BBQ Grill",
        qty: 1,
        cuft: 25
      },
      {
        name: "Coat Rack",
        qty: 1,
        cuft: 5
      },
      {
        name: "Mirror (medium)",
        qty: 1,
        cuft: 10
      },
      {
        name: "Shoe Rack",
        qty: 1,
        cuft: 6
      },
      {
        name: "Kitchen Cart",
        qty: 1,
        cuft: 15
      },
      {
        name: "TV",
        qty: 2,
        cuft: 20
      },
      {
        name: "Box (small)",
        qty: 4,
        cuft: 1.5
      },
      {
        name: "Box (medium)",
        qty: 19,
        cuft: 3
      },
      {
        name: "Box (large)",
        qty: 13,
        cuft: 7
      },
      {
        name: "Box (extra large)",
        qty: 8,
        cuft: 10
      },
      {
        name: "Wardrobe Box",
        qty: 2,
        cuft: 15
      },
      {
        name: "Dish Pack Box",
        qty: 3,
        cuft: 5
      }
    ],
    additionalServices: [

    ],
    packingByCrew: false,
    confirmations: {
      customerConfirmed: true,
      customerConfirmedAt: "2026-06-18T14:23:00",
      foremanAccepted: true,
      foremanAcceptedAt: "2026-06-19T09:10:00",
      coiSubmitted: true,
      coiSubmittedAt: "2026-06-20T11:00:00"
    }
  },
{
    id: "JOB-10433",
    customer: "Liam Henderson",
    customerPhone: "(305) 555-5060",
    pickup: "8001 NW 79th Ave, Doral, FL",
    delivery: "1390 W 49th St, Hialeah, FL",
    pickupCity: "Doral",
    deliveryCity: "Hialeah",
    pickupLat: 25.8195,
    pickupLng: -80.337,
    deliveryLat: 25.8327,
    deliveryLng: -80.3081,
    type: "Local Move",
    cuFt: 1395,
    miles: 4.5,
    status: "Delivery Started",
    driverId: "DRV-1047",
    driverName: "Elena Park",
    crew: [
      "Elena Park"
    ],
    price: 2980,
    payrollStatus: "Pending",
    scheduledAt: "2026-06-19T11:00:00",
    eta: "13:00 PM",
    zone: "Doral",
    priority: "Medium",
    notes: "House to townhouse upgrade. Long carry at delivery side.",
    bedrooms: "3BR",
    pickupBuilding: {
      type: "House",
      bedrooms: "3BR",
      floor: 1,
      hasElevator: false,
      stairsFlights: 0,
      isStrict: false,
      coiRequired: false,
      coiSubmitted: false,
      parkingNotes: "Street parking available",
      longCarryFeet: 0
    },
    deliveryBuilding: {
      type: "House",
      bedrooms: "3BR",
      floor: 1,
      hasElevator: false,
      stairsFlights: 2,
      isStrict: false,
      coiRequired: false,
      coiSubmitted: false,
      parkingNotes: "Driveway clear",
      longCarryFeet: 0
    },
    inventoryItems: [
      {
        name: "Sectional Sofa (L-shape)",
        qty: 1,
        cuft: 90
      },
      {
        name: "End Table",
        qty: 1,
        cuft: 6
      },
      {
        name: "TV Stand (large)",
        qty: 1,
        cuft: 20
      },
      {
        name: "Accent Chair",
        qty: 1,
        cuft: 12
      },
      {
        name: "TV Stand (small)",
        qty: 1,
        cuft: 10
      },
      {
        name: "Console Table",
        qty: 1,
        cuft: 15
      },
      {
        name: "Lamp (table)",
        qty: 1,
        cuft: 3
      },
      {
        name: "Plant (large)",
        qty: 1,
        cuft: 20
      },
      {
        name: "Dining Table (large)",
        qty: 1,
        cuft: 30
      },
      {
        name: "Dining Chair",
        qty: 8,
        cuft: 6
      },
      {
        name: "King Mattress",
        qty: 1,
        cuft: 40
      },
      {
        name: "King Bed Frame",
        qty: 1,
        cuft: 30
      },
      {
        name: "Nightstand",
        qty: 2,
        cuft: 5
      },
      {
        name: "Chest of Drawers",
        qty: 1,
        cuft: 30
      },
      {
        name: "Twin Mattress",
        qty: 1,
        cuft: 20
      },
      {
        name: "Twin Bed Frame",
        qty: 1,
        cuft: 15
      },
      {
        name: "Dresser (single)",
        qty: 1,
        cuft: 25
      },
      {
        name: "Crib",
        qty: 1,
        cuft: 18
      },
      {
        name: "Dryer",
        qty: 1,
        cuft: 30
      },
      {
        name: "Refrigerator (standard)",
        qty: 1,
        cuft: 40
      },
      {
        name: "Piano (baby grand)",
        qty: 1,
        cuft: 120
      },
      {
        name: "Gun Safe (large)",
        qty: 1,
        cuft: 45
      },
      {
        name: "Artwork (large, crated)",
        qty: 1,
        cuft: 10
      },
      {
        name: "Picture Frame XL (6ft+)",
        qty: 1,
        cuft: 15
      },
      {
        name: "Mirror (large)",
        qty: 1,
        cuft: 15
      },
      {
        name: "Wine Rack",
        qty: 1,
        cuft: 8
      },
      {
        name: "Patio Umbrella",
        qty: 1,
        cuft: 5
      },
      {
        name: "Patio Table",
        qty: 1,
        cuft: 25
      },
      {
        name: "TV",
        qty: 1,
        cuft: 20
      },
      {
        name: "TV Box (43\"-65\")",
        qty: 2,
        cuft: 50
      },
      {
        name: "Box (small)",
        qty: 14,
        cuft: 1.5
      },
      {
        name: "Box (medium)",
        qty: 45,
        cuft: 3
      },
      {
        name: "Box (large)",
        qty: 19,
        cuft: 7
      },
      {
        name: "Box (extra large)",
        qty: 9,
        cuft: 10,
        packByCrew: true
      },
      {
        name: "Wardrobe Box",
        qty: 7,
        cuft: 15,
        packByCrew: true
      },
      {
        name: "Dish Pack Box",
        qty: 3,
        cuft: 5
      },
      {
        name: "Suitcase (large)",
        qty: 3,
        cuft: 7
      }
    ],
    additionalServices: [
      {
      id: "svc_st_t",
      name: "Stairs at delivery (2 flights)",
      price: 70
    }
    ],
    packingByCrew: false,
    confirmations: {
      customerConfirmed: true,
      customerConfirmedAt: "2026-06-18T14:23:00",
      foremanAccepted: true,
      foremanAcceptedAt: "2026-06-19T09:10:00",
      coiSubmitted: false
    }
  },
{
    id: "JOB-10434",
    customer: "Emma Suarez",
    customerPhone: "(786) 555-3149",
    pickup: "100 Andalusia Ave, Coral Gables, FL",
    delivery: "1340 Lincoln Rd, Miami Beach, FL",
    pickupCity: "Coral Gables",
    deliveryCity: "Miami Beach",
    pickupLat: 25.7494,
    pickupLng: -80.258,
    deliveryLat: 25.7903,
    deliveryLng: -80.1407,
    type: "Local Move",
    cuFt: 476,
    miles: 22.1,
    status: "Assigned",
    driverId: "DRV-1045",
    driverName: "Anya Volkov",
    crew: [
      "Anya Volkov"
    ],
    price: 1720,
    payrollStatus: "Pending",
    scheduledAt: "2026-06-19T10:00:00",
    eta: "14:30 PM",
    zone: "Coral Gables",
    priority: "Low",
    notes: "Move-in date is rigid (lease starts). 8am arrival required.",
    bedrooms: "1BR",
    pickupBuilding: {
      type: "Apartment",
      bedrooms: "1BR",
      floor: 6,
      hasElevator: true,
      stairsFlights: 0,
      isStrict: false,
      coiRequired: true,
      coiSubmitted: true,
      parkingNotes: "Street parking available",
      longCarryFeet: 0
    },
    deliveryBuilding: {
      type: "Apartment",
      bedrooms: "1BR",
      floor: 9,
      hasElevator: true,
      stairsFlights: 0,
      isStrict: false,
      coiRequired: false,
      coiSubmitted: false,
      parkingNotes: "Service elevator booked",
      longCarryFeet: 0
    },
    inventoryItems: [
      {
        name: "Sleeper Sofa / Sofa Bed",
        qty: 1,
        cuft: 60
      },
      {
        name: "Plant (large)",
        qty: 1,
        cuft: 20
      },
      {
        name: "TV Stand (small)",
        qty: 1,
        cuft: 10
      },
      {
        name: "Coffee Table",
        qty: 1,
        cuft: 12
      },
      {
        name: "End Table",
        qty: 1,
        cuft: 6
      },
      {
        name: "Recliner Chair",
        qty: 1,
        cuft: 20
      },
      {
        name: "Side Table",
        qty: 1,
        cuft: 10
      },
      {
        name: "Bookshelf (large)",
        qty: 1,
        cuft: 20
      },
      {
        name: "Lamp (floor)",
        qty: 1,
        cuft: 8
      },
      {
        name: "Queen Mattress",
        qty: 1,
        cuft: 30
      },
      {
        name: "Queen Bed Frame",
        qty: 1,
        cuft: 25
      },
      {
        name: "Nightstand",
        qty: 2,
        cuft: 5
      },
      {
        name: "Dresser (single)",
        qty: 1,
        cuft: 25
      },
      {
        name: "Standing Desk",
        qty: 1,
        cuft: 30
      },
      {
        name: "Desk Chair",
        qty: 1,
        cuft: 10
      },
      {
        name: "Dryer",
        qty: 1,
        cuft: 30
      },
      {
        name: "Mini Fridge",
        qty: 1,
        cuft: 15
      },
      {
        name: "Microwave",
        qty: 1,
        cuft: 5
      },
      {
        name: "Mirror (medium)",
        qty: 1,
        cuft: 10
      },
      {
        name: "Bar Cart",
        qty: 1,
        cuft: 12
      },
      {
        name: "Wine Rack",
        qty: 1,
        cuft: 8
      },
      {
        name: "TV",
        qty: 1,
        cuft: 20
      },
      {
        name: "Box (small)",
        qty: 1,
        cuft: 1.5
      },
      {
        name: "Box (medium)",
        qty: 5,
        cuft: 3
      },
      {
        name: "Box (large)",
        qty: 3,
        cuft: 7
      },
      {
        name: "Box (extra large)",
        qty: 1,
        cuft: 10
      },
      {
        name: "Dish Pack Box",
        qty: 1,
        cuft: 5
      },
      {
        name: "Suitcase (large)",
        qty: 4,
        cuft: 7
      }
    ],
    additionalServices: [

    ],
    packingByCrew: false,
    confirmations: {
      customerConfirmed: true,
      customerConfirmedAt: "2026-06-18T14:23:00",
      foremanAccepted: true,
      foremanAcceptedAt: "2026-06-19T09:10:00",
      coiSubmitted: true,
      coiSubmittedAt: "2026-06-20T11:00:00"
    }
  },
{
    id: "JOB-10435",
    customer: "Owen Mitchell",
    customerPhone: "(786) 555-7396",
    pickup: "250 NW 23rd St, Miami, FL",
    delivery: "3170 Mary St, Coconut Grove, FL",
    pickupCity: "Wynwood",
    deliveryCity: "Coconut Grove",
    pickupLat: 25.799,
    pickupLng: -80.1972,
    deliveryLat: 25.7283,
    deliveryLng: -80.2402,
    type: "Local Move",
    cuFt: 956,
    miles: 11.2,
    status: "Assigned",
    driverId: "DRV-1046",
    driverName: "Jamal Carter",
    crew: [
      "Jamal Carter"
    ],
    price: 2350,
    payrollStatus: "Pending",
    scheduledAt: "2026-06-21T09:00:00",
    eta: "11:15 AM",
    zone: "Wynwood",
    priority: "Medium",
    notes: "Apt to house. Crew packs fragile only ($420 packing line).",
    bedrooms: "2BR",
    pickupBuilding: {
      type: "Apartment",
      bedrooms: "2BR",
      floor: 18,
      hasElevator: true,
      stairsFlights: 0,
      isStrict: false,
      coiRequired: false,
      coiSubmitted: false,
      parkingNotes: "Street parking available",
      longCarryFeet: 0
    },
    deliveryBuilding: {
      type: "House",
      bedrooms: "2BR",
      floor: 1,
      hasElevator: false,
      stairsFlights: 1,
      isStrict: false,
      coiRequired: false,
      coiSubmitted: false,
      parkingNotes: "Driveway clear",
      longCarryFeet: 0
    },
    inventoryItems: [
      {
        name: "Sofa Recliner (3-seat)",
        qty: 1,
        cuft: 55
      },
      {
        name: "Bookshelf (large)",
        qty: 1,
        cuft: 20
      },
      {
        name: "Rug (large)",
        qty: 1,
        cuft: 25
      },
      {
        name: "Plant (large)",
        qty: 1,
        cuft: 20
      },
      {
        name: "TV Stand (small)",
        qty: 1,
        cuft: 10
      },
      {
        name: "Dining Table (extendable)",
        qty: 1,
        cuft: 35
      },
      {
        name: "Dining Chair",
        qty: 6,
        cuft: 6
      },
      {
        name: "Queen Mattress",
        qty: 1,
        cuft: 30
      },
      {
        name: "Queen Bed Frame",
        qty: 1,
        cuft: 25
      },
      {
        name: "Nightstand",
        qty: 2,
        cuft: 5
      },
      {
        name: "Dresser (triple)",
        qty: 1,
        cuft: 45
      },
      {
        name: "Sleeper Sofa / Sofa Bed",
        qty: 1,
        cuft: 60
      },
      {
        name: "Nightstand",
        qty: 1,
        cuft: 5
      },
      {
        name: "Desk (L-shape)",
        qty: 1,
        cuft: 45
      },
      {
        name: "Desk Chair",
        qty: 1,
        cuft: 10
      },
      {
        name: "Filing Cabinet (2-drawer)",
        qty: 1,
        cuft: 8
      },
      {
        name: "Mini Fridge",
        qty: 1,
        cuft: 15
      },
      {
        name: "Dishwasher",
        qty: 1,
        cuft: 25
      },
      {
        name: "Aquarium (large)",
        qty: 1,
        cuft: 25
      },
      {
        name: "Picture Frame XL (6ft+)",
        qty: 1,
        cuft: 15
      },
      {
        name: "Coat Rack",
        qty: 1,
        cuft: 5
      },
      {
        name: "Mirror (medium)",
        qty: 1,
        cuft: 10
      },
      {
        name: "TV",
        qty: 2,
        cuft: 20
      },
      {
        name: "Box (small)",
        qty: 13,
        cuft: 1.5
      },
      {
        name: "Box (medium)",
        qty: 27,
        cuft: 3
      },
      {
        name: "Box (large)",
        qty: 14,
        cuft: 7
      },
      {
        name: "Box (extra large)",
        qty: 5,
        cuft: 10
      },
      {
        name: "Wardrobe Box",
        qty: 7,
        cuft: 15
      },
      {
        name: "Dish Pack Box",
        qty: 3,
        cuft: 5
      },
      {
        name: "Suitcase (large)",
        qty: 2,
        cuft: 7
      }
    ],
    additionalServices: [
      {
      id: "svc_st_t",
      name: "Stairs at delivery (1 flight)",
      price: 35
    },
      {
      id: "svc_pk",
      name: "Crew packing service",
      price: 480
    }
    ],
    packingByCrew: true,
    confirmations: {
      customerConfirmed: true,
      customerConfirmedAt: "2026-06-18T14:23:00",
      foremanAccepted: true,
      foremanAcceptedAt: "2026-06-19T09:10:00",
      coiSubmitted: false
    }
  },
{
    id: "JOB-10436",
    customer: "Daniel Rivera",
    customerPhone: "(786) 555-1422",
    pickup: "10800 NW 25th St, Doral, FL",
    delivery: "1100 Brickell Bay Dr, Miami, FL",
    pickupCity: "Doral",
    deliveryCity: "Brickell",
    pickupLat: 25.7905,
    pickupLng: -80.3596,
    deliveryLat: 25.7642,
    deliveryLng: -80.1879,
    type: "Storage Out",
    cuFt: 737,
    miles: 3.2,
    status: "Assigned",
    driverId: "DRV-1043",
    driverName: "Sofia Hernandez",
    crew: [
      "Sofia Hernandez"
    ],
    price: 2080,
    payrollStatus: "Pending",
    scheduledAt: "2026-06-25T08:00:00",
    eta: "10:45 AM",
    zone: "Doral",
    priority: "Medium",
    notes: "Storage-out after 4 months. Customer also wants 6 boxes from inventory.",
    bedrooms: "2BR",
    pickupBuilding: {
      type: "House",
      bedrooms: "2BR",
      floor: 1,
      hasElevator: false,
      stairsFlights: 0,
      isStrict: false,
      coiRequired: true,
      coiSubmitted: true,
      parkingNotes: "Street parking available",
      longCarryFeet: 0
    },
    deliveryBuilding: {
      type: "Apartment",
      bedrooms: "2BR",
      floor: 13,
      hasElevator: true,
      stairsFlights: 0,
      isStrict: false,
      coiRequired: false,
      coiSubmitted: false,
      parkingNotes: "Service elevator booked",
      longCarryFeet: 0
    },
    inventoryItems: [
      {
        name: "Sofa (3-seater)",
        qty: 1,
        cuft: 50
      },
      {
        name: "Love Seat",
        qty: 1,
        cuft: 20
      },
      {
        name: "Arm Chair",
        qty: 1,
        cuft: 15
      },
      {
        name: "Side Table",
        qty: 1,
        cuft: 10
      },
      {
        name: "Bookshelf (large)",
        qty: 1,
        cuft: 20
      },
      {
        name: "Bookshelf (medium)",
        qty: 1,
        cuft: 12
      },
      {
        name: "TV Stand (small)",
        qty: 1,
        cuft: 10
      },
      {
        name: "Lamp (floor)",
        qty: 1,
        cuft: 8
      },
      {
        name: "Rug",
        qty: 1,
        cuft: 15
      },
      {
        name: "Dining Table (large)",
        qty: 1,
        cuft: 30
      },
      {
        name: "Dining Chair",
        qty: 4,
        cuft: 6
      },
      {
        name: "King Mattress",
        qty: 1,
        cuft: 40
      },
      {
        name: "King Bed Frame",
        qty: 1,
        cuft: 30
      },
      {
        name: "Nightstand",
        qty: 2,
        cuft: 5
      },
      {
        name: "Dresser (double)",
        qty: 1,
        cuft: 35
      },
      {
        name: "Sleeper Sofa / Sofa Bed",
        qty: 1,
        cuft: 60
      },
      {
        name: "Nightstand",
        qty: 2,
        cuft: 5
      },
      {
        name: "Foosball Table",
        qty: 1,
        cuft: 25
      },
      {
        name: "Picture Frame XL (6ft+)",
        qty: 1,
        cuft: 15
      },
      {
        name: "Coat Rack",
        qty: 1,
        cuft: 5
      },
      {
        name: "Mirror (medium)",
        qty: 1,
        cuft: 10
      },
      {
        name: "Kitchen Cart",
        qty: 1,
        cuft: 15
      },
      {
        name: "TV",
        qty: 2,
        cuft: 20
      },
      {
        name: "Box (small)",
        qty: 10,
        cuft: 1.5
      },
      {
        name: "Box (medium)",
        qty: 23,
        cuft: 3
      },
      {
        name: "Box (large)",
        qty: 10,
        cuft: 7
      },
      {
        name: "Box (extra large)",
        qty: 3,
        cuft: 10
      },
      {
        name: "Wardrobe Box",
        qty: 2,
        cuft: 15
      },
      {
        name: "Suitcase (large)",
        qty: 2,
        cuft: 7
      }
    ],
    additionalServices: [

    ],
    packingByCrew: false,
    confirmations: {
      customerConfirmed: true,
      customerConfirmedAt: "2026-06-18T14:23:00",
      foremanAccepted: true,
      foremanAcceptedAt: "2026-06-19T09:10:00",
      coiSubmitted: true,
      coiSubmittedAt: "2026-06-20T11:00:00"
    }
  },
{
    id: "JOB-10437",
    customer: "Mila Akinyemi",
    customerPhone: "(305) 555-9513",
    pickup: "50 Biscayne Blvd, Miami, FL",
    delivery: "1300 Brickell Bay Dr, Miami, FL",
    pickupCity: "Miami",
    deliveryCity: "Brickell",
    pickupLat: 25.7762,
    pickupLng: -80.188,
    deliveryLat: 25.7619,
    deliveryLng: -80.1885,
    type: "Local Move",
    cuFt: 482,
    miles: 22.1,
    status: "Unassigned",
    crew: [

    ],
    price: 940,
    payrollStatus: "Pending",
    scheduledAt: "2026-06-24T08:00:00",
    zone: "Downtown Miami",
    priority: "Low",
    notes: "Small studio move. Customer working corporate; wants weekend slot.",
    bedrooms: "Studio",
    pickupBuilding: {
      type: "Apartment",
      bedrooms: "Studio",
      floor: 16,
      hasElevator: true,
      stairsFlights: 0,
      isStrict: true,
      coiRequired: true,
      coiSubmitted: true,
      parkingNotes: "Loading zone reserved",
      longCarryFeet: 0
    },
    deliveryBuilding: {
      type: "Apartment",
      bedrooms: "Studio",
      floor: 7,
      hasElevator: true,
      stairsFlights: 0,
      isStrict: false,
      coiRequired: false,
      coiSubmitted: false,
      parkingNotes: "Service elevator booked",
      longCarryFeet: 0
    },
    inventoryItems: [
      {
        name: "Sofa (2-seater)",
        qty: 1,
        cuft: 35
      },
      {
        name: "Lamp (floor)",
        qty: 1,
        cuft: 8
      },
      {
        name: "Ottoman",
        qty: 1,
        cuft: 10
      },
      {
        name: "Arm Chair",
        qty: 1,
        cuft: 15
      },
      {
        name: "Entertainment Center",
        qty: 1,
        cuft: 45
      },
      {
        name: "TV Stand (large)",
        qty: 1,
        cuft: 20
      },
      {
        name: "Bookshelf (medium)",
        qty: 1,
        cuft: 12
      },
      {
        name: "Rug (large)",
        qty: 1,
        cuft: 25
      },
      {
        name: "Coffee Table",
        qty: 1,
        cuft: 12
      },
      {
        name: "Kitchen Table",
        qty: 1,
        cuft: 18
      },
      {
        name: "Dining Chair",
        qty: 4,
        cuft: 6
      },
      {
        name: "Queen Mattress",
        qty: 1,
        cuft: 30
      },
      {
        name: "Queen Bed Frame",
        qty: 1,
        cuft: 25
      },
      {
        name: "Nightstand",
        qty: 2,
        cuft: 5
      },
      {
        name: "Dresser (double)",
        qty: 1,
        cuft: 30
      },
      {
        name: "Mini Fridge",
        qty: 1,
        cuft: 15
      },
      {
        name: "Microwave",
        qty: 1,
        cuft: 5
      },
      {
        name: "Dishwasher",
        qty: 1,
        cuft: 25
      },
      {
        name: "Dryer",
        qty: 1,
        cuft: 30
      },
      {
        name: "Trash Can",
        qty: 1,
        cuft: 5
      },
      {
        name: "Bar Cart",
        qty: 1,
        cuft: 12
      },
      {
        name: "Wine Rack",
        qty: 1,
        cuft: 8
      },
      {
        name: "TV",
        qty: 1,
        cuft: 20
      },
      {
        name: "Box (small)",
        qty: 1,
        cuft: 1.5
      },
      {
        name: "Box (medium)",
        qty: 3,
        cuft: 3
      },
      {
        name: "Box (large)",
        qty: 1,
        cuft: 7
      },
      {
        name: "Box (extra large)",
        qty: 1,
        cuft: 10
      },
      {
        name: "Wardrobe Box",
        qty: 1,
        cuft: 15
      }
    ],
    additionalServices: [

    ],
    packingByCrew: false,
    confirmations: {
      customerConfirmed: true,
      customerConfirmedAt: "2026-06-18T14:23:00",
      foremanAccepted: false,
      coiSubmitted: true,
      coiSubmittedAt: "2026-06-20T11:00:00"
    }
  },
{
    id: "JOB-10438",
    customer: "Ava Aronson",
    customerPhone: "(786) 555-1559",
    pickup: "5333 Collins Ave, Miami Beach, FL",
    delivery: "4400 Ponce de Leon Blvd, Coral Gables, FL",
    pickupCity: "Miami Beach",
    deliveryCity: "Coral Gables",
    pickupLat: 25.8211,
    pickupLng: -80.1271,
    deliveryLat: 25.7384,
    deliveryLng: -80.2599,
    type: "Local Move",
    cuFt: 1366,
    miles: 8.4,
    status: "Pickup Started",
    driverId: "DRV-1048",
    driverName: "Ravi Shankar",
    crew: [
      "Ravi Shankar"
    ],
    price: 4280,
    payrollStatus: "Pending",
    scheduledAt: "2026-06-26T13:00:00",
    eta: "15:15 PM",
    zone: "Miami Beach",
    priority: "High",
    notes: "Penthouse to house. Crew packs entire kitchen + closets. Art crating.",
    bedrooms: "3BR",
    pickupBuilding: {
      type: "Apartment",
      bedrooms: "3BR",
      floor: 4,
      hasElevator: true,
      stairsFlights: 0,
      isStrict: true,
      coiRequired: true,
      coiSubmitted: true,
      parkingNotes: "Loading zone reserved",
      longCarryFeet: 0
    },
    deliveryBuilding: {
      type: "House",
      bedrooms: "3BR",
      floor: 1,
      hasElevator: false,
      stairsFlights: 1,
      isStrict: false,
      coiRequired: false,
      coiSubmitted: false,
      parkingNotes: "Driveway clear",
      longCarryFeet: 0
    },
    inventoryItems: [
      {
        name: "Sofa (2-seater)",
        qty: 1,
        cuft: 35
      },
      {
        name: "Bookshelf (large)",
        qty: 1,
        cuft: 20
      },
      {
        name: "Ottoman",
        qty: 1,
        cuft: 10
      },
      {
        name: "Bookshelf (medium)",
        qty: 1,
        cuft: 12
      },
      {
        name: "Arm Chair",
        qty: 1,
        cuft: 15
      },
      {
        name: "Lamp (table)",
        qty: 1,
        cuft: 3
      },
      {
        name: "Rug",
        qty: 1,
        cuft: 15
      },
      {
        name: "End Table",
        qty: 1,
        cuft: 6
      },
      {
        name: "Side Table",
        qty: 1,
        cuft: 10
      },
      {
        name: "Dining Table (small)",
        qty: 1,
        cuft: 20
      },
      {
        name: "Dining Chair",
        qty: 4,
        cuft: 6
      },
      {
        name: "Queen Mattress",
        qty: 1,
        cuft: 30
      },
      {
        name: "Queen Bed Frame",
        qty: 1,
        cuft: 25
      },
      {
        name: "Nightstand",
        qty: 2,
        cuft: 5
      },
      {
        name: "Dresser (double)",
        qty: 1,
        cuft: 35
      },
      {
        name: "Full Mattress",
        qty: 1,
        cuft: 25
      },
      {
        name: "Full Bed Frame",
        qty: 1,
        cuft: 20
      },
      {
        name: "Nightstand",
        qty: 2,
        cuft: 5
      },
      {
        name: "Dresser (single)",
        qty: 1,
        cuft: 25
      },
      {
        name: "Twin Mattress",
        qty: 1,
        cuft: 20
      },
      {
        name: "Twin Bed Frame",
        qty: 1,
        cuft: 15
      },
      {
        name: "Dresser (single)",
        qty: 1,
        cuft: 25
      },
      {
        name: "Dryer",
        qty: 1,
        cuft: 30
      },
      {
        name: "Refrigerator (standard)",
        qty: 1,
        cuft: 40
      },
      {
        name: "Refrigerator (French door)",
        qty: 1,
        cuft: 50
      },
      {
        name: "Dishwasher",
        qty: 1,
        cuft: 25
      },
      {
        name: "Wine Fridge (3ft+)",
        qty: 1,
        cuft: 12
      },
      {
        name: "Motorcycle",
        qty: 1,
        cuft: 80
      },
      {
        name: "Bicycle",
        qty: 1,
        cuft: 12
      },
      {
        name: "Coat Rack",
        qty: 1,
        cuft: 5
      },
      {
        name: "Shoe Rack",
        qty: 1,
        cuft: 6
      },
      {
        name: "Mirror (medium)",
        qty: 1,
        cuft: 10
      },
      {
        name: "Picture Frame XL (6ft+)",
        qty: 1,
        cuft: 15
      },
      {
        name: "Mirror (large)",
        qty: 1,
        cuft: 15
      },
      {
        name: "Kitchen Cart",
        qty: 1,
        cuft: 15
      },
      {
        name: "Bar Cart",
        qty: 1,
        cuft: 12
      },
      {
        name: "Patio Table",
        qty: 1,
        cuft: 25
      },
      {
        name: "Patio Lounge Chair",
        qty: 1,
        cuft: 18
      },
      {
        name: "Plant (large)",
        qty: 1,
        cuft: 20
      },
      {
        name: "TV",
        qty: 1,
        cuft: 20
      },
      {
        name: "TV Box (43\"-65\")",
        qty: 2,
        cuft: 50
      },
      {
        name: "Box (small)",
        qty: 21,
        cuft: 1.5,
        packByCrew: true
      },
      {
        name: "Box (medium)",
        qty: 12,
        cuft: 3,
        packByCrew: true
      },
      {
        name: "Box (large)",
        qty: 18,
        cuft: 7,
        packByCrew: true
      },
      {
        name: "Box (extra large)",
        qty: 5,
        cuft: 10,
        packByCrew: true
      },
      {
        name: "Wardrobe Box",
        qty: 10,
        cuft: 15,
        packByCrew: true
      },
      {
        name: "Dish Pack Box",
        qty: 5,
        cuft: 5,
        packByCrew: true
      },
      {
        name: "Suitcase (large)",
        qty: 4,
        cuft: 7
      }
    ],
    additionalServices: [
      {
      id: "svc_st_t",
      name: "Stairs at delivery (1 flight)",
      price: 35
    },
      {
      id: "svc_pk",
      name: "Crew packing service",
      price: 480
    }
    ],
    packingByCrew: true,
    confirmations: {
      customerConfirmed: true,
      customerConfirmedAt: "2026-06-18T14:23:00",
      foremanAccepted: true,
      foremanAcceptedAt: "2026-06-19T09:10:00",
      coiSubmitted: true,
      coiSubmittedAt: "2026-06-20T11:00:00"
    }
  },
{
    id: "JOB-10439",
    customer: "Noah Goldstein",
    customerPhone: "(305) 555-9682",
    pickup: "11800 SW 67th Ave, Pinecrest, FL",
    delivery: "200 Crandon Blvd, Key Biscayne, FL",
    pickupCity: "Pinecrest",
    deliveryCity: "Key Biscayne",
    pickupLat: 25.6643,
    pickupLng: -80.3149,
    deliveryLat: 25.6929,
    deliveryLng: -80.161,
    type: "Local Move",
    cuFt: 2249,
    miles: 3.2,
    status: "Assigned",
    driverId: "DRV-1046",
    driverName: "Jamal Carter",
    crew: [
      "Jamal Carter"
    ],
    price: 9620,
    payrollStatus: "Pending",
    scheduledAt: "2026-06-26T14:00:00",
    eta: "16:15 PM",
    zone: "Pinecrest",
    priority: "High",
    notes: "Luxury estate move. Wine cellar (240 bottles). Gun safe (large). 5-person crew.",
    bedrooms: "5BR+",
    pickupBuilding: {
      type: "House",
      bedrooms: "5BR+",
      floor: 1,
      hasElevator: false,
      stairsFlights: 2,
      isStrict: false,
      coiRequired: false,
      coiSubmitted: false,
      parkingNotes: "Street parking available",
      longCarryFeet: 80
    },
    deliveryBuilding: {
      type: "House",
      bedrooms: "5BR+",
      floor: 1,
      hasElevator: false,
      stairsFlights: 1,
      isStrict: false,
      coiRequired: false,
      coiSubmitted: false,
      parkingNotes: "Driveway clear",
      longCarryFeet: 0
    },
    inventoryItems: [
      {
        name: "Sofa (3-seater)",
        qty: 1,
        cuft: 50
      },
      {
        name: "Love Seat",
        qty: 1,
        cuft: 20
      },
      {
        name: "Coffee Table",
        qty: 1,
        cuft: 12
      },
      {
        name: "Side Table",
        qty: 1,
        cuft: 10
      },
      {
        name: "Lamp (floor)",
        qty: 1,
        cuft: 8
      },
      {
        name: "Rug (large)",
        qty: 1,
        cuft: 25
      },
      {
        name: "Rug",
        qty: 1,
        cuft: 15
      },
      {
        name: "Ottoman",
        qty: 1,
        cuft: 10
      },
      {
        name: "Lamp (table)",
        qty: 1,
        cuft: 3
      },
      {
        name: "Plant (large)",
        qty: 1,
        cuft: 20
      },
      {
        name: "Dining Table (large)",
        qty: 1,
        cuft: 30
      },
      {
        name: "Dining Chair",
        qty: 6,
        cuft: 6
      },
      {
        name: "King Mattress",
        qty: 1,
        cuft: 40
      },
      {
        name: "King Bed Frame",
        qty: 1,
        cuft: 30
      },
      {
        name: "Nightstand",
        qty: 2,
        cuft: 5
      },
      {
        name: "Dresser (triple)",
        qty: 1,
        cuft: 45
      },
      {
        name: "Full Mattress",
        qty: 1,
        cuft: 25
      },
      {
        name: "Full Bed Frame",
        qty: 1,
        cuft: 20
      },
      {
        name: "Nightstand",
        qty: 2,
        cuft: 5
      },
      {
        name: "Twin Mattress",
        qty: 1,
        cuft: 20
      },
      {
        name: "Twin Bed Frame",
        qty: 1,
        cuft: 15
      },
      {
        name: "Nightstand",
        qty: 2,
        cuft: 5
      },
      {
        name: "Dresser (double)",
        qty: 1,
        cuft: 35
      },
      {
        name: "Twin Mattress",
        qty: 1,
        cuft: 20
      },
      {
        name: "Twin Bed Frame",
        qty: 1,
        cuft: 15
      },
      {
        name: "Nightstand",
        qty: 1,
        cuft: 5
      },
      {
        name: "Dresser (triple)",
        qty: 1,
        cuft: 45
      },
      {
        name: "Full Mattress",
        qty: 1,
        cuft: 25
      },
      {
        name: "Full Bed Frame",
        qty: 1,
        cuft: 20
      },
      {
        name: "Nightstand",
        qty: 2,
        cuft: 5
      },
      {
        name: "Dishwasher",
        qty: 1,
        cuft: 25
      },
      {
        name: "Peloton Bike",
        qty: 1,
        cuft: 25
      },
      {
        name: "Elliptical Machine",
        qty: 1,
        cuft: 30
      },
      {
        name: "Motorcycle",
        qty: 1,
        cuft: 80
      },
      {
        name: "Trash Can",
        qty: 1,
        cuft: 5
      },
      {
        name: "Mirror (medium)",
        qty: 1,
        cuft: 10
      },
      {
        name: "Coat Rack",
        qty: 1,
        cuft: 5
      },
      {
        name: "Mirror (large)",
        qty: 1,
        cuft: 15
      },
      {
        name: "Shoe Rack",
        qty: 1,
        cuft: 6
      },
      {
        name: "Artwork (large, crated)",
        qty: 1,
        cuft: 10
      },
      {
        name: "Kitchen Cart",
        qty: 1,
        cuft: 15
      },
      {
        name: "Wine Rack",
        qty: 1,
        cuft: 8
      },
      {
        name: "Patio Table",
        qty: 1,
        cuft: 25
      },
      {
        name: "Patio Chair",
        qty: 4,
        cuft: 8
      },
      {
        name: "Patio Umbrella",
        qty: 1,
        cuft: 5
      },
      {
        name: "TV",
        qty: 1,
        cuft: 20
      },
      {
        name: "TV Box (43\"-65\")",
        qty: 4,
        cuft: 50
      },
      {
        name: "Box (small)",
        qty: 22,
        cuft: 1.5
      },
      {
        name: "Box (medium)",
        qty: 106,
        cuft: 3
      },
      {
        name: "Box (large)",
        qty: 17,
        cuft: 7
      },
      {
        name: "Box (extra large)",
        qty: 19,
        cuft: 10
      },
      {
        name: "Wardrobe Box",
        qty: 24,
        cuft: 15
      },
      {
        name: "Dish Pack Box",
        qty: 12,
        cuft: 5
      },
      {
        name: "Suitcase (large)",
        qty: 2,
        cuft: 7
      }
    ],
    additionalServices: [
      {
      id: "svc_st_f",
      name: "Stairs at pickup (2 flights)",
      price: 70
    },
      {
      id: "svc_st_t",
      name: "Stairs at delivery (1 flight)",
      price: 35
    },
      {
      id: "svc_lc",
      name: "Long carry",
      price: 75
    },
      {
      id: "svc_pk",
      name: "Crew packing service",
      price: 480
    }
    ],
    packingByCrew: true,
    confirmations: {
      customerConfirmed: true,
      customerConfirmedAt: "2026-06-18T14:23:00",
      foremanAccepted: true,
      foremanAcceptedAt: "2026-06-19T09:10:00",
      coiSubmitted: false
    }
  },
{
    id: "JOB-10440",
    customer: "Aria Williams",
    customerPhone: "(786) 555-4067",
    pickup: "901 Brickell Key Blvd, Miami, FL",
    delivery: "901 Brickell Key Blvd, Miami, FL",
    pickupCity: "Brickell",
    deliveryCity: "Brickell",
    pickupLat: 25.7654,
    pickupLng: -80.1842,
    deliveryLat: 25.7654,
    deliveryLng: -80.1842,
    type: "Loading/Unloading",
    cuFt: 272,
    miles: 18.4,
    status: "Assigned",
    driverId: "DRV-1044",
    driverName: "Trevon Walker",
    crew: [
      "Trevon Walker"
    ],
    price: 720,
    payrollStatus: "Pending",
    scheduledAt: "2026-06-23T11:00:00",
    eta: "14:15 PM",
    zone: "Brickell",
    priority: "Low",
    notes: "Customer rented PODS container. Crew unloads only at delivery.",
    bedrooms: "2BR",
    pickupBuilding: {
      type: "Apartment",
      bedrooms: "2BR",
      floor: 4,
      hasElevator: true,
      stairsFlights: 0,
      isStrict: true,
      coiRequired: true,
      coiSubmitted: true,
      parkingNotes: "Loading zone reserved",
      longCarryFeet: 0
    },
    deliveryBuilding: {
      type: "Apartment",
      bedrooms: "2BR",
      floor: 14,
      hasElevator: true,
      stairsFlights: 0,
      isStrict: false,
      coiRequired: false,
      coiSubmitted: false,
      parkingNotes: "Service elevator booked",
      longCarryFeet: 0
    },
    inventoryItems: [
      {
        name: "Box (small)",
        qty: 6,
        cuft: 1.5
      },
      {
        name: "Box (medium)",
        qty: 9,
        cuft: 3
      },
      {
        name: "Box (large)",
        qty: 14,
        cuft: 7
      },
      {
        name: "Box (extra large)",
        qty: 6,
        cuft: 10
      },
      {
        name: "Wardrobe Box",
        qty: 2,
        cuft: 15
      },
      {
        name: "TV Stand (large)",
        qty: 1,
        cuft: 20
      },
      {
        name: "Lamp (floor)",
        qty: 1,
        cuft: 8
      },
      {
        name: "Plant (large)",
        qty: 1,
        cuft: 20
      }
    ],
    additionalServices: [

    ],
    packingByCrew: false,
    confirmations: {
      customerConfirmed: true,
      customerConfirmedAt: "2026-06-18T14:23:00",
      foremanAccepted: true,
      foremanAcceptedAt: "2026-06-19T09:10:00",
      coiSubmitted: true,
      coiSubmittedAt: "2026-06-20T11:00:00"
    }
  },
];

export const customers: Customer[] = [
  {
    id: "CUS-401",
    name: "Whitman Residence",
    email: "ej.whitman@gmail.com",
    phone: "(305) 555-7741",
    totalJobs: 4,
    lifetimeValue: 11420,
    lastJobDate: "2026-05-24",
    segment: "Residential",
    status: "Active",
  },
  {
    id: "CUS-402",
    name: "Hayward Logistics",
    email: "ops@haywardlogistics.com",
    phone: "(786) 555-8821",
    totalJobs: 22,
    lifetimeValue: 184800,
    lastJobDate: "2026-05-24",
    segment: "Commercial",
    status: "Active",
  },
  {
    id: "CUS-403",
    name: "Avery Chen",
    email: "avery.chen@hey.com",
    phone: "(305) 555-9912",
    totalJobs: 2,
    lifetimeValue: 2640,
    lastJobDate: "2026-05-24",
    segment: "Residential",
    status: "Active",
  },
  {
    id: "CUS-404",
    name: "Lindsey & Roe LLP",
    email: "ap@lindseyroe.com",
    phone: "(305) 555-4421",
    totalJobs: 11,
    lifetimeValue: 64300,
    lastJobDate: "2026-05-24",
    segment: "Commercial",
    status: "Active",
  },
  {
    id: "CUS-405",
    name: "Pham Family",
    email: "lin.pham@icloud.com",
    phone: "(408) 555-7711",
    totalJobs: 1,
    lifetimeValue: 9840,
    lastJobDate: "2026-05-25",
    segment: "Residential",
    status: "Active",
  },
  {
    id: "CUS-406",
    name: "Birch & Co Studio",
    email: "studio@birchco.design",
    phone: "(305) 555-1180",
    totalJobs: 7,
    lifetimeValue: 18420,
    lastJobDate: "2026-05-24",
    segment: "Repeat",
    status: "Active",
  },
  {
    id: "CUS-407",
    name: "Atelier West Inc",
    email: "hello@atelierwest.co",
    phone: "(305) 555-6610",
    totalJobs: 14,
    lifetimeValue: 96200,
    lastJobDate: "2026-05-24",
    segment: "Commercial",
    status: "Active",
  },
  {
    id: "CUS-408",
    name: "Quinn Estates",
    email: "office@quinnestates.com",
    phone: "(925) 555-7012",
    totalJobs: 3,
    lifetimeValue: 4250,
    lastJobDate: "2026-05-23",
    segment: "Residential",
    status: "Lead",
  },
];

export const invoices: Invoice[] = [
  {
    id: "INV-22041",
    jobId: "JOB-10428",
    customer: "Hollins Move",
    issueDate: "2026-05-23",
    dueDate: "2026-06-06",
    amount: 2980,
    status: "Sent",
  },
  {
    id: "INV-22042",
    jobId: "JOB-10432",
    customer: "Northstar Foods",
    issueDate: "2026-05-23",
    dueDate: "2026-06-06",
    amount: 410,
    status: "Paid",
  },
  {
    id: "INV-22043",
    jobId: "JOB-10431",
    customer: "Renault Family",
    issueDate: "2026-05-22",
    dueDate: "2026-06-05",
    amount: 540,
    status: "Paid",
  },
  {
    id: "INV-22044",
    jobId: "JOB-10421",
    customer: "Whitman Residence",
    issueDate: "2026-05-24",
    dueDate: "2026-06-07",
    amount: 2480,
    status: "Draft",
  },
  {
    id: "INV-22045",
    jobId: "JOB-10417",
    customer: "Atelier West Inc",
    issueDate: "2026-04-30",
    dueDate: "2026-05-14",
    amount: 5240,
    status: "Overdue",
  },
];

export const payrollLines: PayrollLine[] = [
  {
    jobId: "JOB-10428",
    customer: "Hollins Move",
    cuFt: 720,
    miles: 22.4,
    cuFtCharge: 2160,
    mileageCharge: 67.2,
    mileageRate: 3,
    extras: 180,
    adminSurcharge: 95,
    tolls: 8,
    commissionableTotal: 2407.2,
    crewPercent: 22,
    foremanPayout: 318.95,
    helperPayout: 210.63,
    deductions: 0,
    finalPayout: 529.58,
    auditFlags: [],
    status: "Approved",
  },
  {
    jobId: "JOB-10427",
    customer: "Birch & Co Studio",
    cuFt: 460,
    miles: 5.5,
    cuFtCharge: 1150,
    mileageCharge: 16.5,
    mileageRate: 3,
    extras: 80,
    adminSurcharge: 75,
    tolls: 0,
    commissionableTotal: 1246.5,
    crewPercent: 20,
    foremanPayout: 249.3,
    helperPayout: 0,
    deductions: 0,
    finalPayout: 249.3,
    auditFlags: [],
    status: "Approved",
  },
  {
    jobId: "JOB-10425",
    customer: "Lindsey & Roe LLP",
    cuFt: 980,
    miles: 2.8,
    cuFtCharge: 2940,
    mileageCharge: 8.4,
    mileageRate: 3,
    extras: 220,
    adminSurcharge: 110,
    tolls: 4.5,
    commissionableTotal: 3168.4,
    crewPercent: 24,
    foremanPayout: 456.25,
    helperPayout: 304.16,
    deductions: 0,
    finalPayout: 760.41,
    auditFlags: [],
    status: "Pending",
  },
  {
    jobId: "JOB-10421",
    customer: "Whitman Residence",
    cuFt: 640,
    miles: 4.2,
    cuFtCharge: 1920,
    mileageCharge: 12.6,
    mileageRate: 3,
    extras: 240,
    adminSurcharge: 95,
    tolls: 0,
    commissionableTotal: 2172.6,
    crewPercent: 22,
    foremanPayout: 286.78,
    helperPayout: 191.19,
    deductions: 0,
    finalPayout: 477.97,
    auditFlags: ["Piano surcharge missing"],
    status: "Flagged",
  },
  {
    jobId: "JOB-10426",
    customer: "Pham Family",
    cuFt: 1820,
    miles: 386,
    cuFtCharge: 5460,
    mileageCharge: 1544,
    mileageRate: 4,
    extras: 380,
    adminSurcharge: 240,
    tolls: 36,
    commissionableTotal: 7384,
    crewPercent: 24,
    foremanPayout: 1063.3,
    helperPayout: 708.86,
    deductions: 0,
    finalPayout: 1772.16,
    auditFlags: [],
    status: "Pending",
  },
  {
    jobId: "JOB-10422",
    customer: "Hayward Logistics",
    cuFt: 1240,
    miles: 18.6,
    cuFtCharge: 3720,
    mileageCharge: 55.8,
    mileageRate: 3,
    extras: 410,
    adminSurcharge: 180,
    tolls: 12,
    commissionableTotal: 4185.8,
    crewPercent: 24,
    foremanPayout: 602.76,
    helperPayout: 401.84,
    deductions: 0,
    finalPayout: 1004.6,
    auditFlags: ["Three-helper crew but rate at 24% - review"],
    status: "Flagged",
  },
  {
    jobId: "JOB-10423",
    customer: "Avery Chen (Storage In)",
    cuFt: 185,
    miles: 6.1,
    cuFtCharge: 600,
    mileageCharge: 18.3,
    mileageRate: 3,
    extras: 0,
    adminSurcharge: 65,
    tolls: 0,
    commissionableTotal: 618.3,
    crewPercent: 20,
    foremanPayout: 123.66,
    helperPayout: 0,
    deductions: 0,
    finalPayout: 123.66,
    auditFlags: ["Billed CuFt below 200 minimum - check billing volume"],
    status: "Flagged",
  },
];

export const claims: Claim[] = [
  {
    id: "CLM-882",
    jobId: "JOB-10421",
    customer: "Whitman Residence",
    damageType: "Furniture Damage",
    status: "Under Review",
    evidenceCount: 6,
    assignedManager: "Lena Brooks",
    amountAtRisk: 1850,
    notes: "Dining table corner scuffed during loading.",
    openedAt: "2026-05-24",
  },
  {
    id: "CLM-881",
    jobId: "JOB-10422",
    customer: "Hayward Logistics",
    damageType: "Late Delivery",
    status: "Customer Contacted",
    evidenceCount: 3,
    assignedManager: "Lena Brooks",
    amountAtRisk: 950,
    notes: "Window service missed by 38 min. Service credit offered.",
    openedAt: "2026-05-23",
  },
  {
    id: "CLM-880",
    jobId: "JOB-10417",
    customer: "Atelier West Inc",
    damageType: "Property Damage",
    status: "New",
    evidenceCount: 2,
    assignedManager: "Owen Marsh",
    amountAtRisk: 4200,
    notes: "Lobby wall scuffed - awaiting building manager photos.",
    openedAt: "2026-05-22",
  },
  {
    id: "CLM-879",
    jobId: "JOB-10408",
    customer: "Pacific Heights Estate",
    damageType: "Lost Item",
    status: "Approved",
    evidenceCount: 4,
    assignedManager: "Lena Brooks",
    amountAtRisk: 620,
    notes: "Single dish box reported missing. Settled with customer.",
    openedAt: "2026-05-18",
  },
  {
    id: "CLM-878",
    jobId: "JOB-10395",
    customer: "Marina Tower 12B",
    damageType: "Billing Dispute",
    status: "Denied",
    evidenceCount: 5,
    assignedManager: "Owen Marsh",
    amountAtRisk: 380,
    notes: "Customer disputed CuFt - inventory list validated.",
    openedAt: "2026-05-14",
  },
];

export const vehicles: Vehicle[] = [
  {
    id: "VEH-204",
    name: "26' Box Truck #204",
    type: "Box Truck",
    vin: "1FDXF46S7XEA00204",
    plate: "ARS-204",
    status: "Active",
    mileage: 84210,
    nextMaintenance: "2026-06-12",
    registrationExpiry: "2027-01-30",
    insuranceExpiry: "2026-12-04",
    currentDriver: "Marcus Reyes",
    gpsActive: true,
    location: "Brickell, Miami",
  },
  {
    id: "VEH-207",
    name: "Sprinter Van #207",
    type: "Sprinter Van",
    vin: "WD3PE7CD8KP000207",
    plate: "ARS-207",
    status: "Active",
    mileage: 52940,
    nextMaintenance: "2026-07-02",
    registrationExpiry: "2026-09-12",
    insuranceExpiry: "2026-12-04",
    currentDriver: "Sofia Hernandez",
    gpsActive: true,
    location: "I-80 W",
  },
  {
    id: "VEH-211",
    name: "20' Box Truck #211",
    type: "Box Truck",
    vin: "1FDXF46S7XEA00211",
    plate: "ARS-211",
    status: "Idle",
    mileage: 102450,
    nextMaintenance: "2026-05-30",
    registrationExpiry: "2026-08-21",
    insuranceExpiry: "2026-12-04",
    currentDriver: "Trevon Walker",
    gpsActive: true,
    location: "Doral Yard",
  },
  {
    id: "VEH-215",
    name: "Cargo Van #215",
    type: "Cargo Van",
    vin: "1FTBR1Y82MKA00215",
    plate: "ARS-215",
    status: "Active",
    mileage: 41880,
    nextMaintenance: "2026-08-09",
    registrationExpiry: "2027-02-04",
    insuranceExpiry: "2026-12-04",
    currentDriver: "Anya Volkov",
    gpsActive: true,
    location: "Wynwood",
  },
  {
    id: "VEH-220",
    name: "26' Box Truck #220",
    type: "Box Truck",
    vin: "1FDXF46S7XEA00220",
    plate: "ARS-220",
    status: "Maintenance",
    mileage: 138210,
    nextMaintenance: "2026-05-25",
    registrationExpiry: "2026-11-12",
    insuranceExpiry: "2026-12-04",
    currentDriver: "Jamal Carter",
    gpsActive: false,
    location: "Service Bay 2",
  },
  {
    id: "VEH-224",
    name: "Sprinter Van #224",
    type: "Sprinter Van",
    vin: "WD3PE7CD8KP000224",
    plate: "ARS-224",
    status: "Active",
    mileage: 38420,
    nextMaintenance: "2026-08-22",
    registrationExpiry: "2027-04-11",
    insuranceExpiry: "2026-12-04",
    currentDriver: "Elena Park",
    gpsActive: true,
    location: "Doral",
  },
  {
    id: "VEH-230",
    name: "Tractor Trailer #230",
    type: "Tractor Trailer",
    vin: "1XPWD49X1ED230",
    plate: "ARS-230",
    status: "Out of Service",
    mileage: 421100,
    nextMaintenance: "2026-06-01",
    registrationExpiry: "2026-10-05",
    insuranceExpiry: "2026-12-04",
    currentDriver: "Ravi Shankar",
    gpsActive: false,
    location: "Doral Yard",
  },
];

export const routes: Route[] = [
  {
    id: "RT-771",
    name: "Downtown Miami Loop",
    driverId: "DRV-1042",
    driverName: "Marcus Reyes",
    stops: 4,
    miles: 18.4,
    durationHours: 6.5,
    zone: "Downtown Miami",
    status: "Active",
    date: "2026-05-24",
  },
  {
    id: "RT-772",
    name: "Hialeah Commercial",
    driverId: "DRV-1043",
    driverName: "Sofia Hernandez",
    stops: 3,
    miles: 42.1,
    durationHours: 5.2,
    zone: "Hialeah",
    status: "Active",
    date: "2026-05-24",
  },
  {
    id: "RT-773",
    name: "Brickell Delivery Sweep",
    driverId: "DRV-1045",
    driverName: "Anya Volkov",
    stops: 6,
    miles: 12.6,
    durationHours: 4.8,
    zone: "Brickell",
    status: "Active",
    date: "2026-05-24",
  },
  {
    id: "RT-774",
    name: "South Dade Pickup Sweep",
    driverId: "DRV-1047",
    driverName: "Elena Park",
    stops: 5,
    miles: 38.4,
    durationHours: 6.0,
    zone: "South Dade",
    status: "Planned",
    date: "2026-05-25",
  },
  {
    id: "RT-775",
    name: "Long-Haul SJ → LA",
    driverId: "DRV-1048",
    driverName: "Ravi Shankar",
    stops: 1,
    miles: 386,
    durationHours: 14,
    zone: "Long Distance",
    status: "Planned",
    date: "2026-05-25",
  },
];

export const revenueByDay = [
  { day: "Mon", revenue: 18420, jobs: 14 },
  { day: "Tue", revenue: 22610, jobs: 17 },
  { day: "Wed", revenue: 19820, jobs: 15 },
  { day: "Thu", revenue: 26490, jobs: 19 },
  { day: "Fri", revenue: 31240, jobs: 22 },
  { day: "Sat", revenue: 28110, jobs: 21 },
  { day: "Sun", revenue: 14860, jobs: 11 },
];

export const revenueByMonth = [
  { month: "Dec", revenue: 412000, payroll: 138000 },
  { month: "Jan", revenue: 438000, payroll: 145000 },
  { month: "Feb", revenue: 462000, payroll: 154000 },
  { month: "Mar", revenue: 488000, payroll: 162000 },
  { month: "Apr", revenue: 516000, payroll: 168000 },
  { month: "May", revenue: 542000, payroll: 178000 },
];

export const jobsByStatus: { status: JobStatus; count: number }[] = [
  { status: "Unassigned", count: 6 },
  { status: "Assigned", count: 9 },
  { status: "En Route", count: 5 },
  { status: "Pickup Started", count: 3 },
  { status: "Pickup Completed", count: 4 },
  { status: "Delivery Started", count: 2 },
  { status: "Completed", count: 12 },
  { status: "Cancelled", count: 1 },
];

export const jobsByZone = [
  { zone: "Downtown Miami", value: 12 },
  { zone: "Hialeah", value: 8 },
  { zone: "South Dade", value: 6 },
  { zone: "Aventura", value: 4 },
  { zone: "Long Distance", value: 3 },
];

export const driverActivity = [
  { hour: "6a", active: 2 },
  { hour: "7a", active: 4 },
  { hour: "8a", active: 6 },
  { hour: "9a", active: 7 },
  { hour: "10a", active: 7 },
  { hour: "11a", active: 6 },
  { hour: "12p", active: 5 },
  { hour: "1p", active: 6 },
  { hour: "2p", active: 7 },
  { hour: "3p", active: 6 },
  { hour: "4p", active: 4 },
  { hour: "5p", active: 3 },
];

export const kpiSnapshot = {
  jobsToday: 26,
  jobsTodayDelta: 12,
  activeDrivers: 7,
  activeDriversDelta: 2,
  pendingDeliveries: 14,
  pendingDeliveriesDelta: -3,
  revenueToday: 31240,
  revenueTodayDelta: 18.4,
  payrollDue: 18840,
  payrollDueDelta: -4.2,
  openClaims: 4,
  openClaimsDelta: 1,
};

export const zones = [
  "Downtown Miami",
  "Wynwood",
  "Brickell",
  "North Miami",
  "Hialeah",
  "Aventura",
  "South Dade",
  "Long Distance",
];

export const jobStatuses: JobStatus[] = [
  "Unassigned",
  "Assigned",
  "En Route",
  "Pickup Started",
  "Pickup Completed",
  "Delivery Started",
  "Completed",
  "Cancelled",
];
