@FunctionalInterface interface LivingThing { boolean canBreathe(); } @FunctionalInterface interface Bird extends LivingThing { boolean canBreathe(); } class T { Bird b = () -> true; }
