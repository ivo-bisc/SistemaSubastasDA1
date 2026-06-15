package com.subastas.service;

import com.subastas.exception.BusinessException;
import com.subastas.exception.ErrorCodes;
import com.subastas.exception.ResourceNotFoundException;
import com.subastas.model.dto.request.AprobarUsuarioRequest;
import com.subastas.model.dto.request.ProponerCondicionesRequest;
import com.subastas.model.dto.request.RechazarConsignacionRequest;
import com.subastas.model.dto.response.ConsignacionResponse;
import com.subastas.model.dto.response.UsuarioResponse;
import com.subastas.model.entity.Consignacion;
import com.subastas.model.entity.FotoConsignacion;
import com.subastas.model.entity.Usuario;
import com.subastas.model.enums.EstadoConsignacion;
import com.subastas.model.enums.EstadoUsuario;
import com.subastas.repository.ConsignacionRepository;
import com.subastas.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Operaciones de administración: aprobación/rechazo de usuarios pendientes
 * y revisión de consignaciones (proponer condiciones o rechazar).
 */
@Service
@RequiredArgsConstructor
public class AdminService {

    private final UsuarioRepository usuarioRepository;
    private final ConsignacionRepository consignacionRepository;

    @Transactional(readOnly = true)
    public List<UsuarioResponse> listarUsuariosPendientes() {
        return usuarioRepository.findByEstadoAndTokenEmailIsNull(EstadoUsuario.PENDIENTE_VERIFICACION).stream()
                .map(this::mapUsuarioToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public UsuarioResponse aprobarUsuario(Long usuarioId, AprobarUsuarioRequest request) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario", usuarioId));

        if (usuario.getEstado() != EstadoUsuario.PENDIENTE_VERIFICACION) {
            throw new BusinessException(ErrorCodes.ESTADO_INVALIDO,
                    "El usuario no está pendiente de aprobación");
        }

        usuario.setCategoria(request.getCategoria());
        usuario.setEstado(EstadoUsuario.APROBADO);
        usuario = usuarioRepository.save(usuario);

        return mapUsuarioToResponse(usuario);
    }

    @Transactional
    public UsuarioResponse rechazarUsuario(Long usuarioId) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario", usuarioId));

        if (usuario.getEstado() != EstadoUsuario.PENDIENTE_VERIFICACION) {
            throw new BusinessException(ErrorCodes.ESTADO_INVALIDO,
                    "El usuario no está pendiente de aprobación");
        }

        usuario.setEstado(EstadoUsuario.BLOQUEADO);
        usuario = usuarioRepository.save(usuario);

        return mapUsuarioToResponse(usuario);
    }

    @Transactional(readOnly = true)
    public List<ConsignacionResponse> listarConsignacionesPendientes() {
        return consignacionRepository.findByEstadoOrderByIdAsc(EstadoConsignacion.PENDIENTE_INSPECCION).stream()
                .map(this::mapConsignacionToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public ConsignacionResponse proponerCondiciones(Long consignacionId, ProponerCondicionesRequest request) {
        Consignacion consignacion = consignacionRepository.findById(consignacionId)
                .orElseThrow(() -> new ResourceNotFoundException("Consignación", consignacionId));

        if (consignacion.getEstado() != EstadoConsignacion.PENDIENTE_INSPECCION) {
            throw new BusinessException(ErrorCodes.ESTADO_INVALIDO,
                    "La consignación no está pendiente de inspección");
        }

        consignacion.setValorBase(request.getValorBase());
        consignacion.setComisiones(request.getComisiones());
        consignacion.setFechaSubastaPropuesta(request.getFechaSubasta());
        consignacion.setCategoriaPropuesta(request.getCategoria());
        consignacion.setEstado(EstadoConsignacion.PROPUESTA_ENVIADA);
        consignacion = consignacionRepository.save(consignacion);

        return mapConsignacionToResponse(consignacion);
    }

    @Transactional
    public ConsignacionResponse rechazarConsignacion(Long consignacionId, RechazarConsignacionRequest request) {
        Consignacion consignacion = consignacionRepository.findById(consignacionId)
                .orElseThrow(() -> new ResourceNotFoundException("Consignación", consignacionId));

        if (consignacion.getEstado() != EstadoConsignacion.PENDIENTE_INSPECCION) {
            throw new BusinessException(ErrorCodes.ESTADO_INVALIDO,
                    "La consignación no está pendiente de inspección");
        }

        consignacion.setMotivoRechazo(request.getMotivoRechazo());
        consignacion.setEstado(EstadoConsignacion.RECHAZADO);
        consignacion = consignacionRepository.save(consignacion);

        return mapConsignacionToResponse(consignacion);
    }

    private UsuarioResponse mapUsuarioToResponse(Usuario u) {
        return UsuarioResponse.builder()
                .id(u.getId())
                .nombre(u.getNombre())
                .apellido(u.getApellido())
                .email(u.getEmail())
                .categoria(u.getCategoria())
                .estado(u.getEstado())
                .rol(u.getRol())
                .domicilioLegal(u.getDomicilioLegal())
                .paisOrigen(u.getPaisOrigen())
                .fechaRegistro(u.getFechaRegistro())
                .multasPendientes(u.getMultasPendientes())
                .numeroDni(u.getNumeroDni())
                .telefono(u.getTelefono())
                .avatarUrl(u.getAvatarUrl())
                .build();
    }

    private ConsignacionResponse mapConsignacionToResponse(Consignacion c) {
        List<String> fotos = c.getFotos() != null
                ? c.getFotos().stream().map(FotoConsignacion::getUrl).collect(Collectors.toList())
                : List.of();

        return ConsignacionResponse.builder()
                .consignacionId(c.getId())
                .descripcion(c.getDescripcion())
                .datosAdicionales(c.getDatosAdicionales())
                .estado(c.getEstado())
                .aceptaPertenencia(c.isAceptaPertenencia())
                .motivoRechazo(c.getMotivoRechazo())
                .precioSugerido(c.getPrecioSugerido())
                .valorBase(c.getValorBase())
                .comisiones(c.getComisiones())
                .subastaId(c.getSubastaAsignada() != null ? c.getSubastaAsignada().getId() : null)
                .fotosUrls(fotos)
                .usuarioNombre(c.getUsuario().getNombre() + " " + c.getUsuario().getApellido())
                .usuarioEmail(c.getUsuario().getEmail())
                .build();
    }
}
