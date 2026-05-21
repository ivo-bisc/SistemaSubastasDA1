package com.subastas.model.enums;

public enum Categoria {
    COMUN, ESPECIAL, PLATA, ORO, PLATINO;

    public boolean puedeAcceder(Categoria categoriaSubasta) {
        return this.ordinal() >= categoriaSubasta.ordinal();
    }

    public boolean sinLimitesPuja() {
        return this == ORO || this == PLATINO;
    }
}
