package com.subastas.model.entity;

import com.subastas.model.enums.EstadoItem;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "items")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Item {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "numero_pieza")
    private String numeroPieza;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String descripcion;

    @Column(name = "precio_base", precision = 15, scale = 2, nullable = false)
    private BigDecimal precioBase;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private EstadoItem estado = EstadoItem.DISPONIBLE;

    @Column(name = "dueno_actual")
    private String duenioActual;

    @Column(name = "es_obra_arte", nullable = false)
    @Builder.Default
    private boolean esObraArte = false;

    private String artista;

    @Column(name = "fecha_creacion_obra")
    private LocalDate fechaCreacion;

    @Column(columnDefinition = "TEXT")
    private String historia;

    @ElementCollection
    @CollectionTable(name = "item_componentes", joinColumns = @JoinColumn(name = "item_id"))
    @Column(name = "componente")
    @Builder.Default
    private List<String> componentes = new ArrayList<>();

    @OneToMany(mappedBy = "item", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<ImagenItem> imagenes = new ArrayList<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subasta_id")
    private Subasta subasta;

    // Mejor oferta actual para este ítem
    @Column(name = "mejor_oferta", precision = 15, scale = 2)
    private BigDecimal mejorOferta;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mejor_postor_id")
    private Usuario mejorPostor;
}
